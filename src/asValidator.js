/**
 * adds additional functionality of acting as the validator of the child components
 *
 * props :
 *
 * onValidationChange - function to call with all children component's validationProperties (defined at the end of comments)
 *                      from asValidator context. This function can update parent state or library like redux, reflux store.
 *
 * completeValidation - callback function to be called after the components are validated
 *
 * definition
 * validationProperties - object or array of objects with following attributes
 * - componentKey : [required] key to uniquely identify the component
 * - inProgress   : [optional] boolean flag to indicate whether component's validation is in progress
 * - [ Any other fields you want to use in validation ]
 *
 * Sample Examples of validationProperties :
 * - Array of objects : [
 *                        { componentKey: 'TodoList' , errorText : 'List cannot be empty' },
 *                        { componentKey: 'Filter', errorText 'Filter is not valid', filters: [ 'Deleted', 'Saved' ] }
 *                      ]
 *
 * - Simple object : { componentKey: 'CreditCardInput' , inProgress : true,
 *                     progressMessage: 'Please wait... We are verifying the credit card information' }
 *
 */

import React, { Component, PropTypes } from 'react';

import _castArray from 'lodash.castarray';
import _isEmpty from 'lodash.isempty';

const asValidator = (ComposedComponent) => class AsValidator extends Component {

  getChildContext() {
    return {
      updateValidation: this.updateValidation
    };
  }

  static childContextTypes = {
    updateValidation: PropTypes.func
  };

  static propTypes = {
    completeValidation: PropTypes.func.isRequired,
    onValidationChange: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.validationProperties = {};
    this.inProgressValidations = {};
  }

  resetValidationProperties = () => {
    this.validationProperties = {};
    this.inProgressValidations = {};
    this.props.onValidationChange({});
  };

  /**
   *
   * @param componentValidationProperties - validationProperties from child component that will be updated in asValidator context
   * @param triggerValidationChange -  pass it as true to call onValidationChange after update
   */
  updateValidation = (componentValidationProperties, triggerValidationChange) => {
    if (!componentValidationProperties) {
      return;
    }

    const { validationProperties = {}, inProgressValidations = {} } = this;

    // makes  componentValidationProperties an array if not
    _castArray(componentValidationProperties).forEach(vProp => {
      const componentKey = vProp.componentKey;

      if (vProp.inProgress) {
        inProgressValidations[componentKey] = true;
      } else {
        delete inProgressValidations[componentKey];
      }

      // update the component's validationProperties in asValidator context
      validationProperties[componentKey] = vProp;

    });

    if (triggerValidationChange) {
      this.needValidationChange = false;
      this.props.onValidationChange({...validationProperties});
    } else {
      this.needValidationChange = true;
    }
  };

  componentDidUpdate() {

    if (this.needValidationChange) {
      this.needValidationChange = false;

      if (_isEmpty(this.inProgressValidations)) { // all async/sync validations are over
        this.props.completeValidation({...this.validationProperties});
      } else {
        this.props.onValidationChange({...this.validationProperties});
      }
    }
  }

  render() {
    return (
      <ComposedComponent {...this.props} resetValidationProperties={this.resetValidationProperties}/>
    );
  }
};

export const asValidatorDecorator = () => asValidator; // for es2015 class decorators "@asValidatorDecorator"
export default asValidator;
