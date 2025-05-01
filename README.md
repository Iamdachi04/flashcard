- Application for Flashcards

* Dachi Tatunashvili
* Giorgi Lursmanashvili
* Tamar Khristesiashvili
* Beqa Baratashvili

The application paired with the extension is meant to provide a fresh learning experience to users.
It is supposed to enable flashcard creation while browsing. It must let users practice the created flashcards and then read their hand gestures to rate how well the user remembered the flashcard.

The project consists of four main parts : Backend, Frontend, Database and Extension. It was based on the flashcards application built during Software Engineering Seminars by Dachi Tatunashvili.
The project has been reworked and extended to work with better-sqlite3 database. Types predefined during seminars are maintained, types practiceRecord and Flashcard are made into classes complete with constructors, safety features, representation invariants and checkrep functions.

Database is managed through the use of utility functions located in the utils directory. Corresponding unit tests done in mocha are present in test directory. They can be run by using "npm run test" in backend directory.

Functions is backend are commented and documented.

- Collaboration:
  Feature impelementations are distributed among different branches - merged into main after pull request is confirmed by the reviewer. Commits are frequent, complete with meaningful and relevant summaries. So are the pull requests.

- Implemented functionalities:
  Database, backend and the extension portions of the project are functionally implemented. Frontend portion is the remnant of the project assembled during the seminar and is no longer operational. The tasks of integrating frontend with the new backend as well as utilizing the camera to rate the flashcard difficulty are left as exercises to the reader as they are quite trivial.

To run the app:

```bash
npm run setup
npm run dev
```
