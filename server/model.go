package main

import (
	"time"

	"gopkg.in/mgo.v2/bson"
)

type AMA struct {
	AmaId bson.ObjectId `bson:"_id"`

	FromDate *time.Time `bson:"from_date" json:"from_date"`
	EndDate  *time.Time `bson:"end_date" json:"end_date"`

	Maker Maker `bson:"maker"`
}

type Maker struct {
	FirstName  string    `bson:"first_name" json:"first_name"`
	LastName   string    `bson:"last_name" json:"last_name"`
	MiddleName string    `bson:"middle_name" json:"middle_name"`
	MakerId    string    `bson:"maker_id" json:"maker_id"`
	Headline   string    `bson:"headline" json:"headline"`
	PhotoUrl   string    `bson:"photo_url" json:"photo_url"`
	Twitter    string    `bson:"twitter" json:"twitter"`
	Facebook   string    `bson:"facebook" json:"facebook"`
	Products   []Product `bson:"products" json:"products"`
}

type Product struct {
	Name string `bson:"name" json:"name"`
	Url  string `bson:"url" json:"url"`
}
