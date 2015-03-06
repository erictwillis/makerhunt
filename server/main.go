package main

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"os"
	"path"
	"text/template"
	"time"

	"gopkg.in/mgo.v2"

	"github.com/kyeah/gohunt/gohunt"
	"github.com/nlopes/slack"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gorilla/mux"
)

var clientID string
var clientSecret string
var state string
var api *slack.Slack
var session *mgo.Session
var db Database
var config Config = NewConfig()

func init() {
	rand.Seed(time.Now().UTC().UnixNano())

	api = slack.New(config.SlackToken)

	db.Open()
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	state := randSeq(12)
	gohunt.RequestUserOAuthCode(w, r, config.ClientId, config.RedirectUrl, state)
}

func handleRedirect(w http.ResponseWriter, r *http.Request) {
	client, err := gohunt.NewUserOAuthClient(config.ClientId, config.ClientSecret, config.RedirectUrl, r.FormValue("code"))
	fmt.Println(client.GetSettings())
	fmt.Println(client)
	fmt.Println(err)
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

const (
	STATIC = "client"
)

var templates = template.Must(template.ParseGlob(path.Join(STATIC, "*.html")))

func main() {
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
	api.HandleFunc("/amas", apiAmasNew).Methods("POST")
	api.HandleFunc("/amas", apiAmasAll).Methods("GET")
	api.HandleFunc("/amas/{id}", apiAmaGet).Methods("GET")
	api.HandleFunc("/amas/{id}", apiAmaUpdate).Methods("PUT")
	api.HandleFunc("/amas/{id}", apiAmaPatch).Methods("PATCH")
	api.HandleFunc("/amas/{id}", apiAmaDelete).Methods("DELETE")
	api.HandleFunc("/makers", apiMakersAll)

	r.HandleFunc("/login", handleLogin)
	r.HandleFunc("/test", handleRedirect)
	r.HandleFunc("/me", showUser)
	r.HandleFunc("/", PageHandler("index.html"))

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
