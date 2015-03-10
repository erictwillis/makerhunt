package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"strings"
	"text/template"
	"time"

	"github.com/dutchcoders/gohunt/gohunt"
	"github.com/nlopes/slack"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

const (
	// STATIC = "dist/public"
	STATIC = "public"
	// STATIC = ".tmp"
)

var (
	clientID     string
	clientSecret string
	state        string
	api          *slack.Slack
	db           Database
	config       Config = NewConfig()
	store        *sessions.CookieStore
)

var templates = template.Must(template.ParseGlob(path.Join(STATIC, "*.html")))

func init() {
	rand.Seed(time.Now().UTC().UnixNano())

	api = slack.New(config.SlackToken)

	if err := db.Open(); err != nil {
		panic(err)
	}

	store = sessions.NewCookieStore(
		[]byte(config.AuthenticationKey),
		[]byte(config.EncryptionKey),
	)

}

func signoutHandler(w http.ResponseWriter, req *http.Request) {
	session, _ := store.Get(req, config.SessionName)
	session.Options.MaxAge = -1
	session.Save(req, w)

	http.Redirect(w, req, "/", 302)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	state := randSeq(12)

	session, _ := store.Get(r, "oauth")
	session.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
	}
	session.Values["state"] = state
	session.Save(r, w)

	gohunt.RequestUserOAuthCode(w, r, config.ClientId, config.RedirectUrl, state)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "oauth")

	if r.FormValue("state") != session.Values["state"] {
		http.Error(w, "Invalid state", 403)
		return
	}

	client, err := gohunt.NewUserOAuthClient(config.ClientId, config.ClientSecret, config.RedirectUrl, r.FormValue("code"))
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	settings, err := client.GetSettings()
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	username := settings.Username

	var user User
	if err := db.Users.Find(bson.M{"username": username}).One(&user); err == mgo.ErrNotFound {
		// user = NewUser() // import
		user.UserId = bson.NewObjectId()
		user.Name = settings.Name
		user.Username = settings.Username
		user.Email = settings.Email
		user.Headline = settings.Headline
		user.CreatedAt = time.Now()
		user.ImageUrl = settings.ImageUrl
		user.ProfileUrl = settings.ProfileUrl
		user.WebsiteUrl = settings.WebsiteUrl
		user.PHSettings = settings

		// convert to https
		for k, imageUrl := range user.ImageUrl {
			user.ImageUrl[k] = strings.Replace(imageUrl, "http://", "https://", -1)
		}

		err = db.Users.Insert(&user)
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	} else if err == nil {
		// update settings with latest info
		user.ImageUrl = settings.ImageUrl

		// convert to https
		for k, imageUrl := range user.ImageUrl {
			user.ImageUrl[k] = strings.Replace(imageUrl, "http://", "https://", -1)
		}

		user.PHSettings = settings
		if err = db.Users.UpdateId(user.UserId, &user); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	}

	// find
	// or merge?

	session, _ = store.Get(r, config.SessionName)
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: false,
	}

	session.Values["userid"] = user.UserId.Hex()
	session.Values["access_token"] = client.AuthToken.AccessToken
	session.Save(r, w)

	http.Redirect(w, r, "/me", 302)
}

func accessHandler(h http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		session, _ := store.Get(r, config.SessionName)

		userid := session.Values["userid"]
		if userid == nil {
			http.Error(w, "Unauthorized", 401)
			return
		}

		var user User
		if err := db.Users.FindId(bson.ObjectIdHex(userid.(string))).One(&user); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		switch user.Username {
		case "erictwillis":
			fallthrough
		case "remco_verhoef":
			fallthrough
		case "sleinadsanoj":
			h(w, r)
		default:
			http.Error(w, "Unauthorized", 401)
			return
		}

	}
}

func main() {
	go cache.Worker()

	r := mux.NewRouter()
	r.PathPrefix("/assets/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/fonts/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/app/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/components/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/bower_components/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/robots.txt").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/scripts/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/js/").Handler(http.FileServer(http.Dir(STATIC)))
	r.PathPrefix("/css/").Handler(http.FileServer(http.Dir(STATIC)))
	r.NotFoundHandler = http.HandlerFunc(notFoundHandler)

	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/me", apiMeGet).Methods("GET")
	api.HandleFunc("/me/subscribe", apiMeSubscribe).Methods("POST")
	api.HandleFunc("/me/invite", apiMeInvite).Methods("POST")
	api.HandleFunc("/users", accessHandler(apiUsersNew)).Methods("POST")
	api.HandleFunc("/events", accessHandler(apiEventsNew)).Methods("POST")
	api.HandleFunc("/events", apiEventsAll).Methods("GET")
	api.HandleFunc("/events/{id}", accessHandler(apiEventGet)).Methods("GET")
	api.HandleFunc("/events/{id}", accessHandler(apiEventUpdate)).Methods("PUT")
	api.HandleFunc("/events/{id}", accessHandler(apiEventPatch)).Methods("PATCH")
	api.HandleFunc("/events/{id}", accessHandler(apiEventDelete)).Methods("DELETE")
	api.HandleFunc("/makers", apiMakersAll)

	r.HandleFunc("/signout", signoutHandler)
	r.HandleFunc("/login", loginHandler)
	r.HandleFunc("/auth", authHandler)
	r.HandleFunc("/me", pageHandler("index.html"))
	r.HandleFunc("/error", pageHandler("index.html"))
	r.HandleFunc("/", pageHandler("index.html"))

	var handler http.Handler = r

	// install middlewares
	handler = loggingHandler(handler)
	handler = recoverHandler(handler)
	handler = redirectHandler(handler)

	httpAddr := ":" + os.Getenv("PORT")

	err := http.ListenAndServe(httpAddr, handler)
	if err != nil {
		log.Fatalf("ListenAndServe %s: %v", httpAddr, err)
	}
}
