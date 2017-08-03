# REST API for the input of calories
The backend app is designed to handle API requests for managing user and their consumed calories.

## System requirements
For running the project locally the following requirements should be met.
- NodeJS version mentioned in package.json
- Yarn should be globally installed.

## Installation
A fresh installation of the project will usually involve the following steps:
- Clone the repository with ```git clone URL```
- Run ```yarn install``` at the project root.
- Update common/config/index.js with actual values
- Run ```yarn start``` to start the project.

## Running Test Cases
- Run ```yarn test```

### Documenting APIs
API documentation is defined in the ```ApiDoc.raml``` file. This file will be used to generate the HTML documentation.
- Run ```yarn docs``` to generate html api documentation