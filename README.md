# json-up
A NodeJS Express based REST API that provides an interface to Google LevelDB. Google access token are required for authentication and authorization. 

## LevelDB REST API with Google Authentication

**Description:**

This REST API provides an interface to LevelDB, a fast key-value storage library written at Google that provides an ordered mapping from string keys to string values. This API is implemented in Node.js and Express.js framework. User authentication is performed by the client application through the Google API. The returned access token authorizes access to the database corresponding to the user. The API can handle multiple databases simultaneously, identified by the user's email and stored in separate directories. The user's email is extracted from the valid access token.

**Features:**

- **Full CRUD (Create, Read, Update, Delete) operations for keys and values:**
    - Ability to create, read, update, and delete key-value pairs in LevelDB.
    - Support for basic data types like string, number, and boolean.
- **Filtering and pagination mechanisms:**
    - Filtering of query results by key or value. [TODO]
    - Navigation through query results in a paginated manner. [TODO]
- **Transaction support:**
    - Execute read/write operations in an atomic block.
    - Ensure data consistency in case of failures.
- **Multiple database management:**
    - Support for multiple concurrent LevelDB databases.
    - Data isolation between different users.
    - Database identification by user email.

**Authentication:**

User authentication is performed by the client application through the Google API. The returned access token must be sent with each request to the REST API.

**Installation:**

firewall ports:
`sudo ufw allow 9090 # it requires reboot`

1. Clone the GitHub repository: `git clone https://github.com/your-username/leveldb-api.git`
2. Install dependencies: `npm install`
3. Start the API: `npm start`

**Usage:**

The API can be used through HTTP requests. Please refer to the complete API documentation in the `README.md` file for more information on endpoints, parameters, and responses.

Usage of Nodemon for hot reload

**Examples:**

- **Authorization with Google Access Token:**

cURL

```
curl -X GET \
  -H "Authorization: Bearer <access_token>" \
  "http://localhost:9090/api/v1/auth"
```

- **Create entry 1 (better uuid) under the "test" entity type:**

cURL

```
curl -X POST \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{ "id": "1", "value": "value" }' \
  "http://localhost:9090/api/v1/store/test"
```

- **Fetch entries:**

cURL

```
curl -X GET \
  -H "Authorization: Bearer <access_token>" \
  "http://localhost:9090/api/v1/store/test"
```

- **Fetch entry 1:**

cURL

```
curl -X GET \
  -H "Authorization: Bearer <access_token>" \
  "http://localhost:9090/api/v1/store/test/1"
```

- **Delete entry 1:**

cURL

```
curl -X DELETE \
  -H "Authorization: Bearer <access_token>" \
  "http://localhost:9090/api/v1/store/test/1"
```

**Contributing:**

Contributions to the project are welcome! Fork the repository, implement your changes, and submit a pull request.

**License:**

This project is licensed under the MIT license.

**Resources:**

- **LevelDB: [https://github.com/google/leveldb](https://github.com/google/leveldb)**
- **Node.js: [https://nodejs.org/en](https://nodejs.org/en)**
- **Express.js: [https://expressjs.com/](https://expressjs.com/)**
- **Nodemon: [https://github.com/remy/nodemon](https://github.com/remy/nodemon)**
- **Google API Client Library for JavaScript: [https://developers.google.com/api-client-library](https://developers.google.com/api-client-library)**

**Notes:**

- This project is an example of using the Google API for authentication and LevelDB for data storage.
- The API can be easily modified to meet your specific needs.
- Please read the complete API documentation before using it.

**I hope this project is useful to you!**

Marco Aurélio Zoqui
