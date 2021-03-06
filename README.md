# Calories REST Api
The backend app is designed to handle API requests for managing users and their consumed calories.
Api Url: http://vignesarul.info/api/v1
Refer API documentation for usage examples: http://vignesarul.info/docs/
Postman Docs: https://documenter.getpostman.com/view/1444005/collection/6n31ZdH

## System requirements
For running the project locally the following requirements should be met.
- NodeJS version mentioned in package.json
- Yarn should be globally installed.

## Installation
A fresh installation of the project will usually involve the following steps:
- Clone the repository with ```git clone URL```
- Update common/config/config.js with actual values
- Run ```yarn install``` at the project root.
- Run ```yarn start``` to start the project.

## Running Test Cases
- Run ```yarn test```

### Documenting APIs
API documentation is defined in the ```docs/raml/api.raml``` file. This file will be used to generate the HTML documentation.
- Run ```yarn docs``` to generate html api documentation