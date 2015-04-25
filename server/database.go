package main

import (
	mgo "gopkg.in/mgo.v2"
)

type Database struct {
	*mgo.Database
	Events        *mgo.Collection
	Makers        *mgo.Collection
	Users         *mgo.Collection
	Posts         *mgo.Collection
	Notifications *mgo.Collection
}

func (d *Database) Open() error {
	session, err := mgo.Dial(config.MongoUri)
	if err != nil {
		return err
	}
	// defer session.Close()

	session.SetMode(mgo.Monotonic, true)
	/*
		session.Login(&mgo.Credential{
			Username: os.Getenv("MONGO_USERNAME"),
			Password: os.Getenv("MONGO_PASSWROD"),
			Source:   os.Getenv("MONGO_DATABASE"),
		})

	*/
	d.Database = session.DB("")
	d.Makers = d.Database.C("makers")
	d.Users = d.Database.C("users")
	d.Events = d.Database.C("events")
	d.Posts = d.Database.C("posts")
	d.Notifications = d.Database.C("notifications")
	return nil
}
