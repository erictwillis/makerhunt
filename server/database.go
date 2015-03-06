package main

import (
	"os"

	"gopkg.in/mgo.v2"
)

type Database struct {
	*mgo.Database
	Makers *mgo.Collection
}

func (d *Database) Open() error {
	session, err := mgo.Dial(os.Getenv("MONGOLAB_URI"))
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
	return nil
}
