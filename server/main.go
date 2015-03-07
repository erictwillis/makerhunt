package main

import (
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"text/template"
	"time"

	"github.com/kyeah/gohunt/gohunt"
	"github.com/nlopes/slack"
	"gopkg.in/mgo.v2/bson"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

const (
	STATIC = "public"
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

	session, _ := store.Get(r, config.SessionName)
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	session.Values["state"] = state
	session.Save(r, w)

	gohunt.RequestUserOAuthCode(w, r, config.ClientId, config.RedirectUrl, state)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	if r.FormValue("state") != session.Values["state"] {
		http.Error(w, "Invalid state", 403)
		return
	}

	client, err := gohunt.NewUserOAuthClient(config.ClientId, config.ClientSecret, config.RedirectUrl, r.FormValue("code"))
	if err != nil {
		http.Error(w, err.Error(), 403)
		return
	}

	// client.Token
	// gohunt.GenAuthClient(token)
	settings, err := client.GetSettings()
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: true,
	}
	session.Values["userid"] = settings.ID
	session.Values["token"] = client.AuthToken.AccessToken
	session.Save(r, w)

	if _, err = db.Makers.Upsert(bson.M{"userid": settings.ID}, settings); err != nil {
		log.Fatal(err)
	}

	http.Redirect(w, r, "/me", 302)
}

func apiPHUser(w http.ResponseWriter, r *http.Request) {
	var makerId string
	maker, err := api.GetUserInfo(makerId)

	//	ama.Maker = maker
	_ = err
	_ = maker

}

func showUser(w http.ResponseWriter, r *http.Request) {

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
	api.HandleFunc("/amas", apiAmasNew).Methods("POST")
	api.HandleFunc("/amas", apiAmasAll).Methods("GET")
	api.HandleFunc("/amas/{id}", apiAmaGet).Methods("GET")
	api.HandleFunc("/amas/{id}", apiAmaUpdate).Methods("PUT")
	api.HandleFunc("/amas/{id}", apiAmaPatch).Methods("PATCH")
	api.HandleFunc("/amas/{id}", apiAmaDelete).Methods("DELETE")
	api.HandleFunc("/makers", apiMakersAll)

	r.HandleFunc("/signout", signoutHandler)
	r.HandleFunc("/login", loginHandler)
	r.HandleFunc("/auth", authHandler)
	r.HandleFunc("/me", showUser)
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
