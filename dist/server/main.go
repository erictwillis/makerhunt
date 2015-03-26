package main

import (
<<<<<<< HEAD
	"encoding/json"
	"fmt"
	"io/ioutil"
=======
	"fmt"
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"text/template"
	"time"

	"github.com/PuerkitoBio/ghost/handlers"
	"github.com/kurrik/oauth1a"

	"github.com/nlopes/slack"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
	"github.com/gorilla/sessions"
)

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
	_ = state

	client := http.Client{}

	var err error

	userConfig := &oauth1a.UserConfig{}

	if err = userConfig.GetRequestToken(config.Twitter.Service, &client); err != nil {
		log.Printf("Could not get request token: %v", err)
		http.Error(w, "Problem getting the request token", 500)
		return
	}

	var url string
	if url, err = userConfig.GetAuthorizeURL(config.Twitter.Service); err != nil {
		log.Printf("Could not get authorization URL: %v", err)
		http.Error(w, "Problem getting the authorization URL", 500)
		return
	}

	fmt.Printf("%#v", userConfig)

	session, _ := store.Get(r, "oauth")
	session.Options = &sessions.Options{
		Path:     "/",
		HttpOnly: true,
	}
	session.Values["request_token_key"] = userConfig.RequestTokenKey
	session.Values["request_token_secret"] = userConfig.RequestTokenSecret
	session.Save(r, w)

<<<<<<< HEAD
=======
	/*
			oauth := oauth1a.Service{
				RequestURL:   "https://api.twitter.com/oauth/request_token",
				AuthorizeURL: "https://api.twitter.com/oauth/authorize",
				AccessURL:    "https://api.twitter.com/oauth/access_token",
				ClientConfig: config,
				Signer:       new(oauth1a.HmacSha1Signer),
			}

			v := url.Values{}
		        v.Set("grant_type", "client_credentials")
		        client := http.Client{}

		        tokenUrl := fmt.Sprintf("https://%s:%s@api.twitter.com/oauth2/token", config.Twitter.ClientId, config.Twitter.Clie
		        resp, err := client.PostForm(tokenUrl, v)
		        if err != nil {
		                return nil, err
		        }

		        type OAuthResult struct {

			body := "grant_type=client_credentials"
			req, err = http.NewRequest("POST", url, bytes.NewBufferString(body))
			if err != nil {
				return
			}
			req.Header.Set("Authorization", h)
			req.Header.Set("Content-Type", ct)
			if resp, err = c.HttpClient.Do(req); err != nil {
				return
			}
			if resp.StatusCode != 200 {
				err = fmt.Errorf("Got HTTP %v instead of 200", resp.StatusCode)
				return
			}
			if rb, err = ioutil.ReadAll(resp.Body); err != nil {
				return
			}
			if err = json.Unmarshal(rb, &rj); err != nil {
				return
			}
			var (
				token_type   = rj["token_type"].(string)
				access_token = rj["access_token"].(string)
			)
			if token_type != "bearer" {
				err = fmt.Errorf("Got invalid token type: %v", token_type)
			}
			c.SetAppToken(access_token)

			if err := c.FetchAppToken(); err != nil {
				// Handle error ...
			}
			token := c.GetAppToken()

			// Redirect user to consent page to ask for permission
			// for the scopes specified above.
			url := conf.AuthCodeURL("state", oauth2.AccessTypeOffline)
	*/
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b
	http.Redirect(w, r, url, 302)
}

func authHandler(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, "oauth")

<<<<<<< HEAD
	if r.FormValue("denied") != "" {
		http.Error(w, "Twitter oauth request denied.", 500)
		return
	}

	var (
		token    string
		verifier string
		err      error
	)

	fmt.Printf("SESSION: %#v", session)

	userConfig := &oauth1a.UserConfig{
		RequestTokenKey:    session.Values["request_token_key"].(string),
		RequestTokenSecret: session.Values["request_token_secret"].(string),
	}

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

	fmt.Printf("<pre>")
	fmt.Printf("Access Token: %v\n", userConfig.AccessTokenKey)
	fmt.Printf("Token Secret: %v\n", userConfig.AccessTokenSecret)
	fmt.Printf("Screen Name:  %v\n", userConfig.AccessValues.Get("screen_name"))
	fmt.Printf("User ID:      %v\n", userConfig.AccessValues.Get("user_id"))
	fmt.Printf("</pre>")
	fmt.Printf("<a href=\"/signin\">Sign in again</a>")

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
=======
	// http://localhost:9000/auth?denied=o1d4TNJ8fS9FRabg8r2F6aFXvqKO4vjj
	if r.FormValue("state") != session.Values["state"] {
		//		http.Error(w, "Invalid state", 403)
		//		return
	}

	var (
		token    string
		verifier string
		err      error
	)

	userConfig := &oauth1a.UserConfig{
		RequestTokenKey:    session.Values["request_token_key"].(string),
		RequestTokenSecret: session.Values["request_token_secret"].(string),
	}

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

	fmt.Printf("<pre>")
	fmt.Printf("Access Token: %v\n", userConfig.AccessTokenKey)
	fmt.Printf("Token Secret: %v\n", userConfig.AccessTokenSecret)
	fmt.Printf("Screen Name:  %v\n", userConfig.AccessValues.Get("screen_name"))
	fmt.Printf("User ID:      %v\n", userConfig.AccessValues.Get("user_id"))
	fmt.Printf("</pre>")
	fmt.Printf("<a href=\"/signin\">Sign in again</a>")

	/*
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

	*/

	username := userConfig.AccessValues.Get("screen_name")
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b

	var user User
	if err := db.Users.Find(bson.M{"username": username}).One(&user); err == mgo.ErrNotFound {
		// user = NewUser() // import

		user.UserId = bson.NewObjectId()
<<<<<<< HEAD

		user.Twitter = twitterUser

		user.Name = twitterUser.Name
		user.Username = twitterUser.ScreenName
		user.Location = twitterUser.Location
		user.Headline = twitterUser.Description
		user.WebsiteUrl = twitterUser.Url
		user.CreatedAt = time.Now()

=======
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b
		/*
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
		*/

		err = db.Users.Insert(&user)
	} else if err != nil {
		http.Error(w, err.Error(), 500)
		return
	} else if err == nil {
<<<<<<< HEAD
		user.Twitter = twitterUser

		user.Name = twitterUser.Name
		user.Username = twitterUser.ScreenName
		user.Location = twitterUser.Location
		user.Headline = twitterUser.Description
		user.WebsiteUrl = twitterUser.Url
=======
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b
		/*
			// update settings with latest info
			user.ImageUrl = settings.ImageUrl

			// convert to https
			for k, imageUrl := range user.ImageUrl {
				user.ImageUrl[k] = strings.Replace(imageUrl, "http://", "https://", -1)
			}

			user.PHSettings = settings
<<<<<<< HEAD
		*/
		if err = db.Users.UpdateId(user.UserId, &user); err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
=======
			if err = db.Users.UpdateId(user.UserId, &user); err != nil {
				http.Error(w, err.Error(), 500)
				return
			}
		*/
>>>>>>> 6f9e237ff4965b769076a4a7e5da7b398183d08b
	}

	/*
		// find
		// or merge?

	*/
	session, _ = store.Get(r, config.SessionName)
	session.Options = &sessions.Options{
		Path:     "/",
		MaxAge:   86400 * 7,
		HttpOnly: false,
	}

	session.Values["userid"] = user.UserId.Hex()
	session.Values["access_token_key"] = userConfig.AccessTokenKey
	session.Values["access_token_secret"] = userConfig.AccessTokenSecret
	session.Save(r, w)

	http.Redirect(w, r, "/signup", 302)
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
	api.HandleFunc("/me/update-producthunt-data", apiMeUpdateProductHuntData).Methods("POST")
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
	r.HandleFunc("/signup", pageHandler("index.html"))
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
