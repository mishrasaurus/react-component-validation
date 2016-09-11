/**
 * adds additional functionality of acting as the validator of the child components
 *
 * props :
 *
 * transferValidationProperties - function to transfer all child components validationProperties (defined at the end of comments)
 *                              in parent state or store from asValidator context
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
      onValidation: this.onValidation
    };
  }

  static childContextTypes = {
    onValidation: PropTypes.func
  };

  static propTypes = {
    completeValidation: PropTypes.func.isRequired,
    transferValidationProperties: PropTypes.func.isRequired
  };

  constructor(props, context) {
    super(props, context);
    this.validationProperties = {};
    this.inProgressValidations = {};
  }

  resetValidationProperties = () => {
    this.validationProperties = {};
    this.inProgressValidations = {};
    this.props.transferValidationProperties({});
  };

  /**
   *
   * @param componentValidationProperties - validationProperties from child component that will be updated in asValidator context
   * @param shouldTransferValidationProperties -  pass it as true to transfer the parent/store state with component validationProperties
   */
  onValidation = (componentValidationProperties, shouldTransferValidationProperties) => {
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

    if (shouldTransferValidationProperties) {
      this.props.transferValidationProperties({...validationProperties})
    } else {
      this.needValidationPropertiesTransfer = true;
    }
  };

  componentDidUpdate() {

    if (this.needValidationPropertiesTransfer) {
      this.needValidationPropertiesTransfer = false;

      if (_isEmpty(this.inProgressValidations)) { // all async/sync validations are over
        this.props.completeValidation({...this.validationProperties});
      } else {
        this.props.transferValidationProperties({...this.validationProperties});
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
