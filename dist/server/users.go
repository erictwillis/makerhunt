package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"

	"github.com/dutchcoders/gohunt/gohunt"
	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiUsersNew(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Username string `json:"screen_name"`
	}

	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	username := input.Username

	// find user with username
	var user User
	if err := db.Users.Find(bson.M{"username": username}).One(&user); err == nil {
		//WriteJSON(w, user)
		//return
	} else if err != mgo.ErrNotFound {
		http.Error(w, err.Error(), 500)
		return
	} else {
		user = User{UserId: bson.NewObjectId()}
	}

	// parse json input

	// get twitter data
	err := func() error {
		client, err := NewTwitterClient()
		if err != nil {
			return err
		}

		if err = client.Show(&user.Twitter, username); err != nil {
			return err
		}

		fmt.Println(user.Twitter)
		return nil
	}()

	if err != nil {
		fmt.Println(err)
	}

	// get product hunt data
	err = func() error {
		client, err := gohunt.NewOAuthClient(config.ClientId, config.ClientSecret)
		if err != nil {
			return err
		}

		//
		u, err := client.GetUser(username)
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
		fmt.Println(err)
	}

	settings := user.PHSettings

	if user.Name == "" {
		user.Name = settings.Name
	}

	if user.Username == "" {
		user.Username = settings.Username
	}

	if user.Email == "" {
		user.Email = settings.Email
	}

	if user.Headline == "" {
		user.Headline = user.Twitter.Description
	}

	if len(user.ImageUrl) == 0 {
		user.ImageUrl = settings.ImageUrl
	}

	if user.WebsiteUrl == "" {
		user.WebsiteUrl = settings.WebsiteUrl
	}

	if user.ProfileUrl == "" {
		user.ProfileUrl = settings.ProfileUrl
	}

	for k, imageUrl := range user.ImageUrl {
		user.ImageUrl[k] = strings.Replace(imageUrl, "http://", "https://", -1)
	}

	if _, err = db.Users.UpsertId(user.UserId, &user); err != nil {
		http.Error(w, err.Error(), 500)
		return
	}

	WriteJSON(w, user)
}
