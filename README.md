 React Component Validation
===============================

## Usage

This package provides two [High Order Components](https://medium.com/@franleplant/react-higher-order-components-in-depth-cf9032ee6c3e#.ddl3jicad) (**HOC**) for validating a react component and transfering the errors from the component to store or its parent or anywhere you need.

- **WithValidation**
  - It will start the composed component's validation.
  - Transfer the compouted validation properties ( *eg: errors* ) to store/parent/(anywhere you want).
  - It can reset component's validation properties.
  
- **AsValidator** 
  -  Adds additional functionality in a component to act as the validator of its child components.
  -  It maintains the child component's errors, in-progress validations.
  -  Provides a function to get the child componets validation properties and pass this function to children as prop.
  -  It will update all the child components validation properties to store/parent/(anywhere you want).


## Example
 In progress

## Further Reading on HOC
- https://medium.com/@dan_abramov/mixins-are-dead-long-live-higher-order-components-94a0d2f9e750#.ff5cb8iur
- http://natpryce.com/articles/000814.html
- http://jamesknelson.com/structuring-react-applications-higher-order-components/


