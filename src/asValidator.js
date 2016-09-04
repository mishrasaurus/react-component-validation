/**
 * adds additional functionality of acting as the validator of the child components
 *
 * fields :
 *
 * validate     - should be true to start the validation
 *
 * onValidation - function that will take the validationMap ( errorText, dataKey, inProgress ) and update it in the component context
 *
 * errorFields  - map of dataKey -> errorText for the components errors that have error
 *
 * validationInProgress  - map of dataKey -> bool for all the components whose validation are in progress
 *
 * updateValidationProperties - function to update the errorFields,validationInProgress in parent state from component context
 *
 * validationRunner - generator to run all the tasks required after the components are validated
 *
 */

 import React, { Component, PropTypes } from 'react';

 import _isArray from 'lodash.isarray';
 import _isEmpty from 'lodash.isempty';
 import _isEqual from 'lodash.isequal';

 const asValidator = ( ComposedComponent ) => class AsValidator extends Component {

  static propTypes = {
    validate                  : PropTypes.bool,
    errorFields               : PropTypes.object,
    validationInProgress      : PropTypes.object,
    validationRunner          : PropTypes.object.isRequired, // a generator function
    updateValidationProperties: PropTypes.func.isRequired
  };

  constructor( props, context ) {
    super( props, context );
    this.errorFields = {};
    this.validationInProgress = {};
  }

  resetValidationProperties = () => {
    this.errorFields = {};
    this.validationInProgress = {};

    this.props.updateValidationProperties( {}, {} );
  };

  onValidation = ( validationMap, updateValidationProperties ) => {
    if ( !validationMap ) {
      return;
    }

    const { errorFields = {}, validationInProgress = {} } = this;

    // make it an array
    _isArray( validationMap ) || ( validationMap = [ validationMap ] );

    validationMap.forEach( vMap => {
      const { errorText, dataKey} = vMap;

      if ( errorText ) {
        errorFields[ dataKey ] = errorText;
      } else {
        delete errorFields[ dataKey ];
      }

      if ( vMap.inProgress ) {
        validationInProgress[ dataKey ] = true;
      } else {
        delete validationInProgress[ dataKey ];
      }
    } );

    updateValidationProperties ? this.props.updateValidationProperties( { errorFields, validationInProgress } )
    : (this.needValidationPropertiesUpdate = true );
  };

  componentDidUpdate() {
    const that = this,
    { props,  errorFields, validationInProgress } = that;

    if ( _isEmpty( validationInProgress ) ) { // all async/sync validations are over
      if ( that.needValidationPropertiesUpdate || _isEmpty( errorFields ) ) {
        that.completeValidation();
      }
    } else {
      props.updateValidationProperties( { errorFields, validationInProgress } );
    }

  }

  completeValidation = () => {
    const
    that = this,
    { errorFields, validationInProgress } = that,
    { validate, validationRunner } = that.props;

    that.needValidationPropertiesUpdate = false;

    if ( validate ) {
      let isDone;
      do {
        isDone = validationRunner.next( { errorFields, validationInProgress } ).done;
      } while ( !isDone );
    }
  };

  render() {
    return (
      <ComposedComponent
      {...this.props}
      {...this.state}
      onValidation={this.onValidation}
      resetValidationProperties={this.resetValidationProperties} />
      );
  }
};

export const asValidatorDecorator = () => asValidator;
export default asValidator;
