package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

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

	WriteJSON(w, user)
}

func apiMeInvite(w http.ResponseWriter, r *http.Request) {
	session, _ := store.Get(r, config.SessionName)

	userid := session.Values["userid"]
	if userid == nil {
		http.Error(w, "Unauthorized", 401)
		return
	}

	time.Sleep(time.Second * 4)

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
	v.Set("_attempts", "-1")

	url := fmt.Sprintf("https://makerhunt.slack.com/api/users.admin.invite?t=", time.Now().Unix())
	if _, err := http.PostForm(url, v); err != nil {
		panic(err)
	}

	fmt.Printf("Userid %#v", userid)
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

	var user User
	if err := db.Users.FindId(bson.ObjectIdHex(userid.(string))).One(&user); err == mgo.ErrNotFound {
		http.NotFound(w, r)
		return
	} else if err != nil {
		panic(err)
	}

	WriteJSON(w, user)
}
