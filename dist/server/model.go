package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/dutchcoders/gohunt/gohunt"
	"gopkg.in/mgo.v2/bson"
)

type Event struct {
	EventId bson.ObjectId `bson:"_id" json:"event_id"`

	// FromDate *jTime     `bson:"from_date" json:"from_date"`
	FromDate *time.Time `bson:"from_date" json:"from_date"`
	EndDate  *time.Time `bson:"end_date" json:"end_date"`

	Title       string      `bson:"title" json:"title"`
	Link        string      `bson:"link" json:"link"`
	WebsiteUrl  string      `bson:"website_url" json:"website_url"`
	ImageUrl    string      `bson:"image_url" json:"image_url"`
	Headline    string      `bson:"headline" json:"headline"`
	Description string      `bson:"description" json:"description"`
	Username    string      `bson:"username" json:"username"`
	PhProfile   gohunt.User `bson:"ph_profile" json:"ph_profile"`
}

type PHProduct struct {
	DiscussionUrl string `bson:"discussion_url" json:"discussion_url"`
	RedirectUrl   string `bson:"redirect_url" json:"redirect_url"`
	Name          string `bson:"name" json:"name"`
}

type PHProfile struct {
	Username   string      `bson:"username" json:"username"`
	Name       string      `bson:"name" json:"name"`
	Headline   string      `bson:"headline" json:"headline"`
	WebsiteUrl string      `bson:"website_url" json:"website_url"`
	ImageUrl   string      `bson:"image_url" json:"image_url"`
	ProfileUrl string      `bson:"profile_url" json:"profile_url"`
	PHProduct  []PHProduct `bson:"maker_of" json:"maker_of"`
}

type jTime time.Time

func (jt jTime) Format(fmt string) string { return time.Time(jt).Format(fmt) }
func (jt jTime) Year() int                { return time.Time(jt).Year() }

// MarshalJSON implements the json.Marshaler interface.
// The time is a quoted string in RFC 3339 format, with sub-second precision added if present.
func (t jTime) MarshalJSON() ([]byte, error) {
	if y := t.Year(); y < 0 || y >= 10000 {
		// RFC 3339 is clear that years are 4 digits exactly.
		// See golang.org/issue/4556#c15 for more discussion.
		return nil, errors.New("Time.MarshalJSON: year outside of range [0,9999]")
	}

	return []byte(t.Format(`"` + time.RFC3339Nano + `"`)), nil
}

func (jt *jTime) UnmarshalJSON(data []byte) error {
	b := bytes.NewBuffer(data)
	dec := json.NewDecoder(b)
	var s string
	if err := dec.Decode(&s); err != nil {
		return err
	}
	fmt.Println(s)
	t, err := time.Parse("2006-01-02 15:04:05", s)
	if err != nil {
		return err
	}
	*jt = jTime(t)
	return nil
}

// session.FindRef(person.Products)
/*
type Person struct {
	PersonId   bson.ObjectId     `bson:"_id"`
	User       User              `bson:"user" json:"user"`
	Maker      User              `bson:"maker" json:"maker"`
	FirstName  string            `bson:"first_name" json:"first_name"`
	MiddleName string            `bson:"middle_name" json:"middle_name"`
	LastName   string            `bson:"last_name" json:"last_name"`
	Headline   string            `bson:"headline" json:"headline"`
	ProfileUrl string            `bson:"profile_url" json:"profile_url"`
	WebsiteUrl string            `bson:"website_url" json:"website_url"`
	Images     map[string]string `bson:"images" json:"image"`
	CreatedAt  string            `bson:"created_at" json:"created_at"`
	ProductsRef   mgo.DBRef         // []Product     `bson:"products" json:"products"`
}


func (p* Person) Products() *mgo.Query {
    session.FindRef(p.ProductsRef)
}
*/
type User struct {
	Username string        `bson:"username" json:"username"`
	UserId   bson.ObjectId `bson:"_id" json:"user_id"`
	Name     string        `bson:"name" json:"name"`
	Email    string        `bson:"email" json:"email"`
	// FirstName  string            `bson:"first_name" json:"first_name"`
	// MiddleName string            `bson:"middle_name" json:"middle_name"`
	// LastName   string            `bson:"last_name" json:"last_name"`
	Headline   string            `bson:"headline" json:"headline"`
	ProfileUrl string            `bson:"profile_url" json:"profile_url"`
	WebsiteUrl string            `bson:"website_url" json:"website_url"`
	ImageUrl   map[string]string `bson:"image_url" json:"image_url"`
	// Images     map[string]string `bson:"images" json:"image"`
	CreatedAt time.Time `bson:"created_at" json:"created_at"`
	// ProductsRef   mgo.DBRef         // []Product     `bson:"products" json:"products"`
	//Credentials[]
	PHSettings gohunt.UserSettings `bson:"ph_settings" json:"ph_settings"`
	Twitter    TwitterUser         `bson:"twitter" json:"twitter_profile"`
}

type Product struct {
	ProductId bson.ObjectId `bson:"_id"`
	Name      string        `bson:"name" json:"name"`
	Url       string        `bson:"url" json:"url"`
}

type Maker struct {
	MakerId  string `bson:"maker_id" json:"maker_id"`
	Username string `bson:"username" json:"username"`
}
