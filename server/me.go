package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"reflect"
	"strings"
	"time"

	"github.com/dutchcoders/gohunt/gohunt"
	"github.com/gorilla/mux"
	"gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiMeSubscribe(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	userid := session.Values["userid"]
	if userid == nil {
		http.Error(w, "Unauthorized", 401)
		return
	}

	// check maker
	fmt.Printf("Userid %#v", userid)

	var user User
	if err := db.Users.FindId(bson.ObjectIdHex(userid.(string))).One(&user); err == mgo.ErrNotFound {
		http.NotFound(w, r)
		return
	} else if err != nil {
		panic(err)
	}

	var input struct {
		Email string `json:"email" valid:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		panic(err)
	}

	user.Email = input.Email

	if err := db.Users.UpdateId(user.UserId, &user); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	// subscrbe
	var MailchimpSubscribe struct {
		Apikey      string `json:"apikey"`
		DoubleOptin bool   `json:"double_optin"`
		Email       struct {
			Email string `json:"email,omitempty"`
			Euid  string `json:"euid,omitempty"`
			Leid  string `json:"leid,omitempty"`
		} `json:"email,omitempty"`
		EmailType        string            `json:"email_type,omitempty"`
		Id               string            `json:"id,omitempty"`
		MergeVars        map[string]string `json:"merge_vars"`
		ReplaceInterests bool              `json:"replace_interests"`
		SendWelcome      bool              `json:"send_welcome"`
		UpdateExisting   bool              `json:"update_existing"`
	}

	MailchimpSubscribe.Id = "b728b0f47a"
	MailchimpSubscribe.Apikey = config.Mailchimp.Apikey

	MailchimpSubscribe.ReplaceInterests = false
	MailchimpSubscribe.SendWelcome = true
	MailchimpSubscribe.UpdateExisting = true
	MailchimpSubscribe.EmailType = "html"
	firstname := strings.Split(user.Name, " ")[0]
	name := user.Name
	MailchimpSubscribe.MergeVars = map[string]string{"FNAME": firstname, "NAME": name}
	MailchimpSubscribe.Email.Email = input.Email

	url := "https://us10.api.mailchimp.com/2.0/lists/subscribe.json"

	buf, _ := json.Marshal(MailchimpSubscribe)
	body := bytes.NewBuffer(buf)

	resp, err := http.Post(url, "text/json", body)
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	b2, err := ioutil.ReadAll(resp.Body)
	fmt.Println(string(b2))

	// todo check status
	//{"status":"error","code":200,"name":"List_DoesNotExist","error":"Invalid MailChimp List ID: 57413"}
	// WriteJSON(w, user)
}

func apiMeUpdateProductHuntData(w http.ResponseWriter, r *http.Request) {
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

	// get product hunt data
	err := func() error {
		client, err := gohunt.NewOAuthClient(config.ClientId, config.ClientSecret)
		if err != nil {
			return err
		}

		u, err := client.GetUser(user.Username)
		if err != nil {
			return err
		}

		fmt.Printf("%#v", u)

		user.PHSettings = gohunt.UserSettings{}
		user.PHSettings.ID = u.ID
		user.PHSettings.Name = u.Name
		user.PHSettings.Username = u.Username
		user.PHSettings.Headline = u.Headline
		user.PHSettings.Created = u.Created
		user.PHSettings.ImageUrl = u.ImageUrl
		user.PHSettings.ProfileUrl = u.ProfileUrl
		user.PHSettings.WebsiteUrl = u.WebsiteUrl
		user.PHSettings.Votes = u.Votes
		user.PHSettings.Posts = u.Posts
		user.PHSettings.MakerOf = u.MakerOf
		user.PHSettings.Followers = u.Followers
		user.PHSettings.Following = u.Following
		return nil
	}()

	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	if err := db.Users.UpdateId(user.UserId, &user); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	WriteJSON(w, user)
}

func apiMeNotifications(w http.ResponseWriter, r *http.Request) {
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

	vars := mux.Vars(r)

	fromDate := time.Now()
	if _, ok := vars["from_date"]; !ok {
		//	fromDate = val
	}

	notifications := []Notification{}
	iter := db.Notifications.
		Find(bson.M{"created_at": bson.M{"$lt": fromDate}, "owner_id": user.UserId}).
		Sort("-created_at").
		Limit(20).Iter()

	defer iter.Close()

	notification := Notification{}
	for iter.Next(&notification) {
		notification.LoadUser()

		notifications = append(notifications, notification)
	}

	if err := iter.Close(); err != nil {
	}

	Filter(notifications, func(path string, value reflect.Value) error {
		fmt.Println(path)
		/*
			if path == "[].PhProfile.Votes" {
				v := reflect.ValueOf([]gohunt.Vote{})
				value.Set(v)
			}
			if path == "[].PhProfile.Posts" {
				v := reflect.ValueOf([]gohunt.Post{})
				value.Set(v)
			}
			if path == "[].PhProfile.Followers" {
				v := reflect.ValueOf([]gohunt.User{})
				value.Set(v)
			}
			if path == "[].PhProfile.Following" {
				v := reflect.ValueOf([]gohunt.User{})
				value.Set(v)
			}
			if path == "[].PhProfile.MakerOf[].Makers" {
				v := reflect.ValueOf([]gohunt.User{})
				value.Set(v)
			}
		*/
		return nil
	})

	WriteJSON(w, notifications)
}

func apiMeNotificationsSeen(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	userId := session.Values["userid"]
	if userId == nil {
		http.Error(w, "Unauthorized", 401)
		return
	}

	change :=
		bson.M{
			"$set": bson.M{
				"seen": true,
			},
		}

	// notifications := []Notification{}
	resp, err := db.Notifications.UpdateAll(bson.M{"owner_id": bson.ObjectIdHex(userId.(string))}, change)
	// 	.Apply(change, &notifications)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error", 500)
		return
	}
	fmt.Printf("%#v", resp)

}

func apiMeInvite(w http.ResponseWriter, r *http.Request) {
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

	if len(user.PHSettings.MakerOf) == 0 {
		http.NotFound(w, r)
		return
	}

	var input struct {
		Email string `json:"email" valid:"email"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		panic(err)
	}

	user.Email = input.Email

	if err := db.Users.UpdateId(user.UserId, &user); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	v := url.Values{}
	v.Set("email", user.Email)
	v.Set("channels", "C03PM0S6Y")
	v.Set("first_name", strings.Split(user.Name, " ")[0])
	v.Set("token", "xoxp-3803026192-3803026200-3879665935-c62c8e")
	v.Set("set_active", "true")
	v.Set("_attempts", "1")

	url := fmt.Sprintf("https://%s.slack.com/api/users.admin.invite?t=%d", "makerhunt", time.Now().Unix())
	if resp, err := http.PostForm(url, v); err != nil {
		http.Error(w, err.Error(), 500)
		return
	} else {
		fmt.Println("%#v", resp)
		b, _ := ioutil.ReadAll(resp.Body)
		fmt.Printf("Userid %#v %s %s", userid, user.Email, string(b))
	}

	// check {"ok":false,"error":"already_in_team"}

	WriteJSON(w, user)
}

func apiMeGet(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	userid := session.Values["userid"]
	if userid == nil {
		http.Error(w, "Unauthorized", 401)
		return
	}

	fmt.Printf("Userid %#v", userid)
	//time.Sleep(time.Second * 10)

	var user User
	if err := db.Users.FindId(bson.ObjectIdHex(userid.(string))).One(&user); err == mgo.ErrNotFound {
		http.NotFound(w, r)
		return
	} else if err != nil {
		panic(err)
	}

	WriteJSON(w, user)
}
