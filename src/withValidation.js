/**
 * adds additional functionality of validating the components
 * required fields :
 *
 * validate     - props.validate should be true to start the validation
 *
 * validation   - A function in component that will return the validation of component
 *                it should return an object as required by  "getValidationMap"
 *
 * onValidation - props.onValidation is called with the "validationMap". validationMap is calculated based on the validation function result
 *
 */

 import React, { Component, PropTypes} from 'react';

 const getValidationMap = ( dataKey, params = {} ) => {
  const errorText = params.errorText || __( 'Required field cannot be empty' ),
  validationMap = {
    dataKey,
    errorText: null
  };

  !params.isValid && ( validationMap.errorText = errorText );

  return validationMap;
};

const withValidation = ( ComposedComponent ) => class WithValidation extends Component {

  static propTypes = {
    validate: PropTypes.bool,
    resetValidations: PropTypes.bool,
    onValidation: PropTypes.func.isRequired
  }

  componentDidUpdate( prevProps, prevState ) {
    const that = this,
    props = that.props,
    componentRef = that.refs.component;

    if ( props.validate ) {
      const validationObj = componentRef.validation() || {};

      props.onValidation( getValidationMap( props.dataKey || componentRef.props.dataKey, validationObj ) );
    } else if ( props.resetValidations ) {
      props.onValidation( getValidationMap( props.dataKey || componentRef.props.dataKey, { isValid: true } ) );
    }
  }

  render() {
    return <ComposedComponent ref="component" {...this.props} />;
  }
};

export const withValidationDecorator = () => withValidation;

export default withValidation;