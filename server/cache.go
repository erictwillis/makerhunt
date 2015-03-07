package main

import (
	"log"
	"sync"
	"time"

	"github.com/nlopes/slack"
)

type Cache struct {
	makers []slack.User
	mutex  sync.Mutex
}

func (c *Cache) lock() {
	c.mutex.Lock()
}

func (c *Cache) unlock() {
	c.mutex.Unlock()
}

func (c *Cache) setMakers(makers []slack.User) {
	cache.lock()
	defer cache.unlock()
	c.makers = makers
}

func (c *Cache) Makers() []slack.User {
	cache.lock()
	defer cache.unlock()
	return c.makers
}

func (c *Cache) Worker() {
	// cache updater
	for {
		log.Printf("Updating cache...")

		makers, err := api.GetUsers()
		if err != nil {
			log.Printf("Error retrieving posts list: %s", err)
			continue
		}

		cache.setMakers(makers)
		log.Printf("Makers updated.")

		time.Sleep(time.Minute * 5)
	}
}

var cache Cache = NewCache()

func NewCache() Cache {
	return Cache{makers: []slack.User{}, mutex: sync.Mutex{}}
}
