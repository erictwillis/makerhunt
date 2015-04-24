package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"strings"
	"text/template"
	"time"

	"github.com/PuerkitoBio/ghost/handlers"
	"github.com/kurrik/oauth1a"

	"github.com/dutchcoders/slack"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"

	/*
			"github.com/goamz/goamz/aws"
		"github.com/goamz/goamz/sqs"
	*/)

const ()

var (
	clientID     string
	clientSecret string
	state        string
	api          *slack.Slack
	db           Database
	config       Config = NewConfig()
	store        *sessions.CookieStore
)

var templates = template.Must(template.ParseGlob(path.Join(config.Static, "*.html")))

func botQueue() {
	/*
		for {
			var rmr *sqs.ReceiveMessageResponse

			if rmr, err = q.ReceiveMessage(1); err != nil {
				log.Printf("%s", err)
				return
			}

			if len(rmr.Messages) == 0 {
				log.Printf("Nothing to do")
				time.Sleep(60 * time.Second)
				continue
			}
			message := rmr.Messages[0]
			var pr struct {
				PullRequest PullRequest `json:"pull_request"`
				Repository  Repository  `json:"repository"`
				Action      string      `json:"action"`
			}

			log.Println(message.Body)

			if err = json.Unmarshal([]byte(message.Body), &pr); err != nil {
				log.Printf("%s", err)
				continue
			}
		}

	*/
}

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

func signoutHandler(w http.ResponseWriter, r *http.Request) {
	cookie, _ := GetSessionCookie(r)
	cookie.Delete(w, r)

	http.Redirect(w, r, "/", 302)
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	state := randSeq(12)
	_ = state

	client := http.Client{}

	cookie, _ := GetSessionCookie(r)

	userConfig := &oauth1a.UserConfig{}
	userConfig.AccessTokenKey = cookie.AccessTokenKey()
	userConfig.AccessTokenSecret = cookie.AccessTokenSecret()

	url := fmt.Sprintf("https://api.twitter.com/1.1/account/verify_credentials.json")

	var err error
	r, err = http.NewRequest("GET", url, nil)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = config.Twitter.Service.Sign(r, userConfig)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	resp, err := client.Do(r)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if resp.StatusCode == 200 {
		var twitterUser TwitterUser
		if err := json.NewDecoder(resp.Body).Decode(&twitterUser); err != nil {
			log.Printf("Error getting access token: %v", err)
			http.Error(w, "Problem getting an access token", 500)
			return
		}

		username := twitterUser.ScreenName

		fmt.Println("Username %s", username)
		// should update user here with verify credentials data
		var user User
		if err := db.Users.Find(bson.M{"username": username}).One(&user); err == mgo.ErrNotFound {
		} else if err == nil {
			if user.IsEnrolledMaker() {
				http.Redirect(w, r, "/timeline", 302)
				return
			}
		} else {
			http.Error(w, err.Error(), 500)
			return
		}

		url = "/signup"
		http.Redirect(w, r, url, 302)
		return
	}

	fmt.Printf("%#v\n", resp)
	fmt.Printf("%#v\n", userConfig)

	if err = userConfig.GetRequestToken(config.Twitter.Service, &client); err != nil {
		log.Printf("Could not get request token: %v", err)
		http.Error(w, "Problem getting the request token", 500)
		return
	}

	if url, err = userConfig.GetAuthorizeURL(config.Twitter.Service); err != nil {
		log.Printf("Could not get authorization URL: %v", err)
		http.Error(w, "Problem getting the authorization URL", 500)
		return
	}

	fmt.Printf("%#v", userConfig)

	ac, _ := GetOAuthCookie(r)
	ac.SetRequestTokenKey(userConfig.RequestTokenKey)
	ac.SetRequestTokenSecret(userConfig.RequestTokenSecret)
	ac.Save(w, r)

	http.Redirect(w, r, url, 302)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	if r.FormValue("denied") != "" {
		http.Error(w, "Twitter oauth request denied.", 500)
		return
	}

	ac, _ := GetOAuthCookie(r)

	userConfig := &oauth1a.UserConfig{
		RequestTokenKey:    ac.RequestTokenKey(),
		RequestTokenSecret: ac.RequestTokenSecret(),
	}

	var (
		token    string
		verifier string
		err      error
	)

	if token, verifier, err = userConfig.ParseAuthorize(r, config.Twitter.Service); err != nil {
		log.Printf("Could not parse authorization: %v", err)
		http.Error(w, "Problem parsing authorization", 500)
		return
	}

	httpClient := new(http.Client)

	if err = userConfig.GetAccessToken(token, verifier, config.Twitter.Service, httpClient); err != nil {
		log.Printf("Error getting access token: %v", err)
		http.Error(w, "Problem getting an access token", 500)
		return
	}

	username := userConfig.AccessValues.Get("screen_name")

	url := fmt.Sprintf("https://api.twitter.com/1.1/account/verify_credentials.json")

	r, err = http.NewRequest("GET", url, nil)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	err = config.Twitter.Service.Sign(r, userConfig)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	resp, err := httpClient.Do(r)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if resp.StatusCode != 200 {
		b, _ := ioutil.ReadAll(resp.Body)
		fmt.Println(string(b))
		http.Error(w, "Error", 500)
		return
	}

	var twitterUser TwitterUser
	if err := json.NewDecoder(resp.Body).Decode(&twitterUser); err != nil {

		http.Error(w, err.Error(), 500)
		return
	}

	var user User
	if err := db.Users.Find(bson.M{"username": username}).One(&user); err == mgo.ErrNotFound {
		// user = NewUser() // import

		user.UserId = bson.NewObjectId()

		user.Twitter = twitterUser

		user.Name = twitterUser.Name
		user.Username = twitterUser.ScreenName
		user.Location = twitterUser.Location
		user.Headline = twitterUser.Description
		user.WebsiteUrl = twitterUser.Url
		user.CreatedAt = time.Now()

		imageUrl := twitterUser.ProfileImageUrl
		imageUrl = strings.Replace(imageUrl, "_normal", "", -1)
		imageUrl = strings.Replace(imageUrl, "http", "https", -1)
		user.ImageUrl = map[string]string{
			"32px": imageUrl,
			"48px": imageUrl,
			"73px": imageUrl,
			"40px": imageUrl,
			"44px": imageUrl,
			"88px": imageUrl,
		}

		err = db.Users.Insert(&user)
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	} else if err == nil {
		user.Twitter = twitterUser

		user.Name = twitterUser.Name
		user.Username = twitterUser.ScreenName
		user.Location = twitterUser.Location
		user.Headline = twitterUser.Description
		user.WebsiteUrl = twitterUser.Url

		imageUrl := twitterUser.ProfileImageUrl
		imageUrl = strings.Replace(imageUrl, "_normal", "", -1)
		imageUrl = strings.Replace(imageUrl, "http", "https", -1)
		user.ImageUrl = map[string]string{
			"32px": imageUrl,
			"48px": imageUrl,
			"73px": imageUrl,
			"40px": imageUrl,
			"44px": imageUrl,
			"88px": imageUrl,
		}

		if err = db.Users.UpdateId(user.UserId, &user); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	}

	/*
		// find
		// or merge?

	*/
	cookie, _ := GetSessionCookie(r)
	cookie.SetUserId(user.UserId)
	cookie.SetAccessTokenKey(userConfig.AccessTokenKey)
	cookie.SetAccessTokenSecret(userConfig.AccessTokenSecret)
	cookie.Save(w, r)

	fmt.Printf("%#v ", user.IsEnrolledMaker(), user.Email)

	if user.IsEnrolledMaker() {
		http.Redirect(w, r, "/timeline", 302)
		return
	}

	http.Redirect(w, r, "/signup", 302)
}

type Role string

const (
	RoleAdmin Role = "admin"
	RoleUser  Role = "user"
	RoleMaker Role = "maker"
)

func Has(haystack []interface{}, needle interface{}) bool {
	for i, _ := range haystack {
		if haystack[i] == needle {
			return true
		}
	}

	return false
}

/*

type Context struct {
	User User
}

type HandlerFunc func(Context, http.ResponseWriter, *http.Request)
*/

func accessHandler(h http.HandlerFunc, roles ...Role) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// context := Context{}
		cookie, _ := GetSessionCookie(r)

		if !cookie.IsAuthenticated() {
			http.Error(w, "Unauthorized", 401)
			return
		}

		userid := cookie.UserId()

		var user User
		if err := db.Users.FindId(userid).One(&user); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		/*
			if Has(roles, RoledAdmin) {
				switch user.Username {
				case "erictwillis":
					fallthrough
				case "remco_verhoef":
					fallthrough
				case "sleinadsanoj":
					break
				default:
					http.Error(w, "Unauthorized", 401)
					return
				}
			}
		*/

		h(w, r)
	}
}

func main() {
	go cache.Worker()

	r := mux.NewRouter()
	r.PathPrefix("/assets/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/fonts/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/app/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/components/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/bower_components/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/robots.txt").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/scripts/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/js/").Handler(http.FileServer(http.Dir(config.Static)))
	r.PathPrefix("/css/").Handler(http.FileServer(http.Dir(config.Static)))
	r.NotFoundHandler = http.HandlerFunc(notFoundHandler)

	api := r.PathPrefix("/api/v1").Subrouter()
	api.HandleFunc("/hooks/smtp", apiHookSmtp).Methods("POST")
	api.HandleFunc("/me", apiMeGet).Methods("GET")
	api.HandleFunc("/me/subscribe", apiMeSubscribe).Methods("POST")
	api.HandleFunc("/me/notifications", apiMeNotifications).Methods("GET")
	api.HandleFunc("/me/notifications-seen", apiMeNotificationsSeen).Methods("POST")
	api.HandleFunc("/me/update-producthunt-data", apiMeUpdateProductHuntData).Methods("POST")
	api.HandleFunc("/me/invite", apiMeInvite).Methods("POST")
	api.HandleFunc("/users", accessHandler(apiUsersNew, RoleAdmin)).Methods("POST")

	api.HandleFunc("/timeline", accessHandler(apiTimelineCreate, RoleAdmin, RoleUser)).Methods("POST")
	api.HandleFunc("/timeline/{id}/comments", accessHandler(apiTimelineCommentCreate, RoleAdmin, RoleUser)).Methods("POST")
	api.HandleFunc("/timeline/{post_id}/comments/{comment_id}", accessHandler(apiTimelineCommentDelete, RoleAdmin, RoleUser)).Methods("DELETE")
	api.HandleFunc("/timeline", apiTimelineAll).Methods("GET")
	api.HandleFunc("/timeline/{id}", accessHandler(apiTimelineGet, RoleAdmin, RoleUser)).Methods("GET")
	api.HandleFunc("/timeline/{id}", accessHandler(apiTimelineUpdate, RoleAdmin, RoleUser)).Methods("PUT")
	api.HandleFunc("/timeline/{id}", accessHandler(apiTimelinePatch, RoleAdmin, RoleUser)).Methods("PATCH")
	api.HandleFunc("/timeline/{id}", accessHandler(apiTimelineDelete, RoleAdmin, RoleUser)).Methods("DELETE")
	api.HandleFunc("/timeline/{post_id}/like", accessHandler(apiTimelineLike, RoleAdmin, RoleUser))

	api.HandleFunc("/events", accessHandler(apiEventsCreate, RoleAdmin)).Methods("POST")
	api.HandleFunc("/events", apiEventsAll).Methods("GET")
	api.HandleFunc("/events/{id}", accessHandler(apiEventGet, RoleAdmin)).Methods("GET")
	api.HandleFunc("/events/{id}", accessHandler(apiEventUpdate, RoleAdmin)).Methods("PUT")
	api.HandleFunc("/events/{id}", accessHandler(apiEventPatch, RoleAdmin)).Methods("PATCH")
	api.HandleFunc("/events/{id}", accessHandler(apiEventDelete, RoleAdmin)).Methods("DELETE")
	api.HandleFunc("/makers", apiMakersAll)

	r.HandleFunc("/signout", signoutHandler)
	r.HandleFunc("/login", loginHandler)
	r.HandleFunc("/auth", authHandler)
	r.HandleFunc("/me", pageHandler("index.html"))
	r.HandleFunc("/signup", pageHandler("index.html"))
	r.HandleFunc("/timeline", pageHandler("index.html"))
	r.HandleFunc("/error", pageHandler("index.html"))
	r.HandleFunc("/", pageHandler("index.html"))

	var handler http.Handler = r

	// install middlewares
	handler = loggingHandler(handler)
	handler = recoverHandler(handler)
	handler = redirectHandler(handler)
	handler = handlers.GZIPHandler(handler, nil)

	httpAddr := ":" + os.Getenv("PORT")

	err := http.ListenAndServe(httpAddr, handler)
	if err != nil {
		log.Fatalf("ListenAndServe %s: %v", httpAddr, err)
	}
}
