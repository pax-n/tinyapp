# TinyApp Project

We know that those links that you find of your favourite memes are too long sometimes.

But don't worry, we got you covered with the best place to compress all your meme-related links whether it's related to dogs or cats. 

TinyApp is a full stack web application built with Node and Express that allows users to shorten long URLs (à la bit.ly).

## Final Product

!["Screenshot of URLs page"](https://github.com/pax-n/docs/urls-page.png)

!["Screenshot of new URLs"](https://github.com/pax-n/docs/urls-new.png)

!["Screenshot of register page"](https://github.com/pax-n/docs/urls-registration.png)

!["Screenshot of warning header"](https://github.com/pax-n/docs/urls-warning.png)


## Dependencies

- Node.js
- Express
- EJS
- bcrypt
- body-parser
- cookie-session

## Getting Started

1) Install all dependencies (using the `npm install` command).
2) Run the development web server using the `node express_server.js` command.
3) Go to `localhost:8080` on your browser.

## Using TinyApp

#### Register/Login

Users must be logged in to create new links, view them, and edit them.

Users will be given a notice to login or register upon visiting.

#### Create New Links

Click Create New URL on navigation bar at the top.

This will then bring you to a page where you can shorten any url of your liking.

#### Edit or Delete Short Links

In My URLs, you can edit or delete any link you want.

Upon clicking edit, you will be directed to the shortURL page where you can edit your long url.

#### Sharable link

The path to use any short link is /u/:shortURL. This will redirect you to the long URL.

Make sure not to be using /url/:shortURL because this will redirect you to the edit page.

Clicking on the corresponding shortURL will direct you to the website.