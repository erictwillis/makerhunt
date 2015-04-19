package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"reflect"
	"strconv"
	"strings"
	"time"
	"unicode"

	"github.com/PuerkitoBio/goquery"
	"github.com/gorilla/mux"

	mgo "gopkg.in/mgo.v2"
	"gopkg.in/mgo.v2/bson"
)

func apiTimelineGet(w http.ResponseWriter, r *http.Request) {
	/*
		vars := mux.Vars(r)
		if id, ok := vars["id"]; ok {
			event := Event{}
			id := bson.ObjectIdHex(id)
			err := db.Events.FindId(id).One(&event)
			if err != nil {
				panic(err)
			}

			WriteJSON(w, event)
		} else {
			http.Error(w, "Error", 500)
			return
		}
	*/
}

func apiTimelineUpdate(w http.ResponseWriter, r *http.Request) {
	/*
		vars := mux.Vars(r)
		fmt.Println(vars)
		if id, ok := vars["id"]; ok {
			event := Event{}
			if err := json.NewDecoder(r.Body).Decode(&event); err != nil {
				http.Error(w, "Error", 500)
				return
			}

			err := db.Events.UpdateId(bson.ObjectIdHex(id), event)
			if err != nil {
				http.Error(w, "Error", 500)
				return
			}

			WriteJSON(w, event)
		} else {
			http.Error(w, "Missing id parameter.", 422)
			return
		}
	*/
}

func apiTimelineDelete(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	if id, ok := vars["id"]; ok {
		id := bson.ObjectIdHex(id)
		// check if authorised for user
		if err := db.Posts.RemoveId(id); err == mgo.ErrNotFound {
			http.NotFound(w, r)
			return
		} else if err != nil {
			panic(err)
		}

		WriteJSON(w, id)
	} else {
		http.Error(w, "Missing id parameter.", 422)
		return
	}
}

func apiTimelineLike(w http.ResponseWriter, r *http.Request) {
	postId := bson.NewObjectId()

	vars := mux.Vars(r)
	if val, ok := vars["post_id"]; ok {
		postId = bson.ObjectIdHex(val)
	}

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

	change := mgo.Change{
		ReturnNew: true,
	}

	switch r.Method {
	case "PUT":
		change.Update = bson.M{
			"$addToSet": bson.M{
				"liked_by": bson.ObjectIdHex(userid.(string)),
			},
		}
	case "DELETE":
		change.Update = bson.M{
			"$pull": bson.M{
				"liked_by": bson.ObjectIdHex(userid.(string)),
			},
		}

	}

	post := Post{}
	_, err := db.Posts.FindId(postId).Apply(change, &post)
	if err != nil {
		fmt.Printf("%#v", err.(*mgo.LastError).Error())
		fmt.Println(err.Error())
		http.Error(w, "Error", 500)
		return
	}

	post.LoadUser()

	for idx, _ := range post.Comments {
		if err := post.Comments[idx].LoadUser(); err != nil {
			fmt.Println(err)
		}

	}

	notification := Notification{}
	notification.NotificationId = bson.NewObjectId()
	notification.SetPost(&post)
	notification.SetUser(&user)
	notification.SetOwner(post.User)
	notification.CreatedAt = time.Now()
	notification.Action = "liked"
	notification.Action = "liked"
	notification.Type = "post"
	notification.Seen = false

	err = db.Notifications.Insert(notification)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}

	WriteJSON(w, post)
}

func apiTimelinePatch(w http.ResponseWriter, r *http.Request) {
	/*
		vars := mux.Vars(r)
			if id, ok := vars["id"]; ok {
				event := Event{}
				id := bson.ObjectIdHex(id)
				if err := db.Events.FindId(id).One(&event); err == mgo.ErrNotFound {
					http.NotFound(w, r)
					return
				} else if err != nil {
					panic(err)
				}

				// Merge(Event with resp)
				if err := db.Events.UpdateId(id, event); err == mgo.ErrNotFound {
					http.NotFound(w, r)
					return
				} else if err != nil {
					panic(err)
				}

				WriteJSON(w, event)
			} else {
				http.Error(w, "Error", 500)
				return
			}
	*/
}

/*
var ErrNotSupported = errors.New("Not Supported")


func Filter(value interface{}, fn func(path string, value reflect.Value) error) error {
	switch reflect.ValueOf(value).Kind() {
	case reflect.Struct:
		fallthrough
	case reflect.Slice:
	default:
		return ErrNotSupported
	}
	return filter(reflect.ValueOf(value), "", fn)
}

func filter(value reflect.Value, path string, fn func(path string, value reflect.Value) error) error {
	if err := fn(path, value); err != nil {
		return err
	}
	switch value.Kind() {
	case reflect.Struct:
		for i := 0; i < value.NumField(); i++ {
			tField := value.Type().Field(i)

			if err := filter(value.Field(i), fmt.Sprintf("%s.%s", path, tField.Name), fn); err != nil {
				return err
			}
		}
	case reflect.Slice:
		for i := 0; i < value.Len(); i++ {
			if err := filter(value.Index(i), fmt.Sprintf("%s[]", path), fn); err != nil {
				return err
			}
		}
	default:
	}

	return nil
}
*/

type Comment struct {
	CommentId bson.ObjectId `bson:"_id" json:"comment_id"`
	Body      string        `bson:"body" json:"body"`
	UserId    bson.ObjectId `bson:"user_id"`
	User      *User         `bson:"-" json:"user"`
	PostId    bson.ObjectId `bson:"post_id" json:"post_id"`
	CreatedAt time.Time     `bson:"created_at" json:"created_at"`
}

// should we use a unmarshal struct for this?
func (c *Comment) SetUser(user User) {
	c.UserId = user.UserId
	c.User = &user
}

func (c *Comment) LoadUser() error {
	var user User
	if err := db.Users.FindId(c.UserId).One(&user); err == mgo.ErrNotFound {
		return nil
	} else if err != nil {
		return err
	}
	c.User = &user
	return nil
}

type Post struct {
	PostId    bson.ObjectId   `bson:"_id" json:"post_id"`
	UserId    bson.ObjectId   `bson:"user_id"`
	User      *User           `bson:"-" json:"user"`
	CreatedAt time.Time       `bson:"created_at" json:"created_at"`
	UpdatedAt time.Time       `bson:"updated_at" json:"updated_at"`
	Status    string          `bson:"status" json:"status"`
	Type      string          `bson:"type" json:"type"`
	Comments  []Comment       `bson:"comments" json:"comments"`
	Via       Via             `bson:"via" json:"via"`
	Cards     []Card          `bson:"cards" json:"cards"`
	LikedBy   []bson.ObjectId `bson:"liked_by" json:"liked_by"`
}

type Card struct {
	CardId   bson.ObjectId `bson:"_id" json:"card_id"`
	Type     string        `bson:"type" json:"type"`
	Source   string        `bson:"source" json:"source"`
	Headline string        `bson:"headline" json:"headline"`
	Text     string        `bson:"text" json:"text"`
	Url      string        `bson:"url" json:"url"`
	Icon     string        `bson:"icon" json:"icon"`
	Image    string        `bson:"image" json:"img"`
}

type Via struct {
	ProviderId string `bson:"provider_id" json:"provider_id"`
	Provider   string `bson:"provider" json:"provider"`
	Url        string `bson:"url" json:"url"`
}

// should we use a unmarshal struct for this?
func (p *Post) SetUser(user User) {
	p.UserId = user.UserId
	p.User = &user
}

func (p *Post) LoadUser() error {
	var user User
	if err := db.Users.FindId(p.UserId).One(&user); err == mgo.ErrNotFound {
		return nil
	} else if err != nil {
		return err
	}

	p.User = &user
	return nil
}

func apiTimelineAll(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)

	skip := 0
	if val, err := strconv.Atoi(r.FormValue("offset")); err == nil {
		skip = val
	}

	fromDate := time.Now()
	if _, ok := vars["from_date"]; !ok {
		//	fromDate = val
	}

	limit := 20

	posts := []Post{}

	fmt.Println(skip)

	iter := db.Posts.
		Find(bson.M{"created_at": bson.M{"$lt": fromDate}}).
		Sort("-created_at").
		Skip(skip).
		Limit(limit).Iter()

	defer iter.Close()

	post := Post{}
	for iter.Next(&post) {
		post.LoadUser()

		for idx, _ := range post.Comments {
			if err := post.Comments[idx].LoadUser(); err != nil {
				fmt.Println(err)
			}

		}

		posts = append(posts, post)
	}

	if err := iter.Close(); err != nil {
	}

	Filter(posts, func(path string, value reflect.Value) error {
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

	WriteJSON(w, posts)
}

func apiTimelineCommentDelete(w http.ResponseWriter, r *http.Request) {
	postId := bson.NewObjectId()
	commentId := bson.NewObjectId()

	vars := mux.Vars(r)
	if val, ok := vars["post_id"]; ok {
		postId = bson.ObjectIdHex(val)
	}

	if val, ok := vars["comment_id"]; ok {
		commentId = bson.ObjectIdHex(val)
	}

	change := mgo.Change{
		ReturnNew: false,
		Update: bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
			"$pull": bson.M{
				"comments": bson.M{
					"_id": commentId,
				},
			}}}

	post := Post{}
	_, err := db.Posts.FindId(postId).Apply(change, &post)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error", 500)
		return
	}

}

func apiTimelineCommentCreate(w http.ResponseWriter, r *http.Request) {
	comment := Comment{}
	if err := json.NewDecoder(r.Body).Decode(&comment); err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}

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

	comment.CommentId = bson.NewObjectId()
	comment.SetUser(user)
	comment.CreatedAt = time.Now()

	change := mgo.Change{
		ReturnNew: false,
		Update: bson.M{
			"$set": bson.M{
				"updated_at": time.Now(),
			},
			"$addToSet": bson.M{
				"comments": comment,
			}}}

	post := Post{}
	_, err := db.Posts.FindId(comment.PostId).Apply(change, &post)
	if err != nil {
		fmt.Println(err)
		http.Error(w, "Error", 500)
		return
	}

	post.LoadUser()

	notification := Notification{}
	notification.NotificationId = bson.NewObjectId()
	notification.SetPost(&post)
	notification.SetUser(&user)
	notification.SetOwner(post.User)
	notification.CreatedAt = time.Now()
	notification.Action = "commented"
	notification.Type = "post"
	notification.Seen = false

	err = db.Notifications.Insert(notification)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}

	WriteJSON(w, comment)
}

func apiTimelineCreate(w http.ResponseWriter, r *http.Request) {
	post := Post{}
	if err := json.NewDecoder(r.Body).Decode(&post); err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}

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

	post.PostId = bson.NewObjectId()
	post.SetUser(user)
	post.CreatedAt = time.Now()
	post.Via = Via{Provider: "article"}
	post.Comments = []Comment{}
	post.Cards = []Card{}
	post.LikedBy = []bson.ObjectId{}

	words := strings.FieldsFunc(post.Status, func(c rune) bool {
		return unicode.IsSpace(c)
	})

	post.Status = ""
	for _, word := range words {
		if !strings.HasPrefix(word, "http://") && !strings.HasPrefix(word, "https://") {
			post.Status += fmt.Sprintf("%s ", word)
			continue
		}

		url := word
		doc, err := goquery.NewDocument(url)
		if err == nil {
			card := Card{Url: url, CardId: bson.NewObjectId()}

			doc.Find("title").Each(func(i int, s *goquery.Selection) {
				card.Headline = s.Text()
			})

			doc.Find("meta").Each(func(i int, s *goquery.Selection) {
				if title, _ := s.Attr("property"); title != "og:title" {
					return
				}

				card.Headline, _ = s.Attr("content")
			})

			doc.Find("link").Each(func(i int, s *goquery.Selection) {
				if rel, _ := s.Attr("rel"); rel != "shortcut icon" {
					return
				}

				card.Icon, _ = s.Attr("href")
			})

			doc.Find("meta").Each(func(i int, s *goquery.Selection) {
				if name, _ := s.Attr("name"); name != "description" {
					return
				}

				card.Text, _ = s.Attr("content")
			})

			doc.Find("meta").Each(func(i int, s *goquery.Selection) {
				if property, _ := s.Attr("property"); property != "og:image" {
					return
				}

				card.Image, _ = s.Attr("content")
			})

			post.Cards = append(post.Cards, card)
		}

		post.Status += fmt.Sprintf("<a href='%s'>%s</a> ", word, word)
	}

	err := db.Posts.Insert(&post)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error", 500)
		return
	}
	WriteJSON(w, post)
}
