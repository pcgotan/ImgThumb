# Stateless microservice in Nodejs serving two functionality

-   Authentication
-   Image Thumbnail generation

## Setup

### Clone the repo

```
git clone https://github.com/pcgotan/ImgThumb.git
```

### Change the directory

```
cd ImgThumb
```

### Install the dependencies

```
sudo npm install
```

Some of the dependencies might not work with the newer version of node, change the version if needed

### Run the service

```
sudo npm start
```

## Usages

After the successful setup,

-   Open a API client like [Postman](https://www.postman.com/) and set the address
    `http://localhost:3000/api/users/login` and request to `POST`
-   Select `x-www-form-urlencoded` in the `Body` in postman.
-   Set `username` and `password` key to any random string.
-   Hit send, the response looks like this

    ```
    {
      "user": "barakObama",
      "authorized": true,
      "token":    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkc2Zhc2RmIiwiaWF0IjoxNTkwNDIyMjk3LCJleHAiOjE1OTA0NDM4OTd9.s7nxn3zTYI1AVbQZoYO8u1bJ2B79m9oYarNpmBTXWI0"
    }
    ```

-   If this kind of response doesn't appear then see the logs in `log` folder.
-   Now the user is authorized and must have get a token, this will use in validating the further requests.
-   Now change the address to the `http://localhost:3000/api/thumbnail`
-   Set the key in Header to `token` and set the `value` the corresponding token value.
-   set the `key` in `x-www-form-urlencoded` to `url` and fill the `value` the url of Image to download.
-   The downloaded image is in the `images/original` directory.
-   Hit the send, the response body should look like this

    ```
    {
        "conversionStatus": "successful",
        "success": "Thumbnail generated",
        "userInfo": "prashant",
        "thumbnail": "./images/resized/1590425528675.jpg"
    }
    ```

-   A thumbnail image file is generated in the `images/resized/` folder, with a unique file name.

## Features

-   Mocked the authentication service so that user credentials can be artitarily accepted.
-   Token is dynamically updating on each login request (even with the same username)
-   Correct token is required for succesful execution of the each further request
-   Stroing both original and resized images in local directory.
-   Used modern javascript ES6 syntax.
-   A logging system is implemented. Logs and errors are saved in separate files, they aren't shown in terminal console.
-   Testing is also implemented with proper assertions and code coverage is around 81%

## Libraries used

-   express: web application framework
-   Sharp: Image processing library
-   jsonwebtoken: JWT token generation
-   download: for Downloading stuffs
-   morgan: for Logging
-   supertest: for Testing
-   chai: for Assertions
-   nyc: for Code coverage
