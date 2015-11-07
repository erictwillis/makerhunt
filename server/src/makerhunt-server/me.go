package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/dutchcoders/gohunt/gohunt"
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
	v.Set("channels", "C03PM0S6S")
	v.Set("first_name", strings.Split(user.Name, " ")[0])
	v.Set("token", config.SlackToken)
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
