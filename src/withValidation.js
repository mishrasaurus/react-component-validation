/**
 * adds additional functionality of starting or resetting the validation of composed components
 * also passes the validationProperties (defined at the end of comments) to onValidation function
 *
 * props :
 * shouldValidate - boolean prop that should be true to start the validation and false to stop the validation
 * shouldResetValidations - boolean prop to be passed as true to reset the validation of the component
 *
 *  make sure to toggle these boolean props from true to false
 *  else it could lead to infinite component update loop
 *
 * props/context:
 * onValidation - onValidation is used to pass the validationProperties to its parent/store.
 *                it can be passed via props or context (preference is given to props)
 *
 * props/component ref
 * validation   - function that will validate the component and return its validationProperties.
 *                user can have the validation function in component itself instead of having it as its props,
 *                validation will be called from component ref ( For validations that depend on component internal state)
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

import React, { Component, PropTypes} from 'react';
import _castArray from 'lodash.castarray';
import _isEmpty from 'lodash.isempty';
import invariant from 'invariant'

const withValidation = (ComposedComponent) => class WithValidation extends Component {

  static contextTypes = {
    onValidation: PropTypes.func // required field. can be passed via props too
  };

  static propTypes = {
    validation: PropTypes.func,
    shouldValidate: PropTypes.bool,
    shouldResetValidation: PropTypes.bool,

    onValidation: PropTypes.func // required field. can be passed via context too
  };

  constructor(props, context) {
    super(props, context);
    // for stateless functional components we cannot attach ref to ComposedComponent
    this.canAttachRef = ComposedComponent.prototype instanceof Component;
    this.componentName = ComposedComponent.displayName || ComposedComponent.name || 'Component';

    invariant(props.onValidation || context.onValidation,
      `Could not find required "onValidation" function in either the context or props of ` +
      `"${this.componentName}" for withValidation HOC.`
    );
  }

  getComponentValidationProperties = () => {
    const
      props = this.props,
      validation = props.validation || ( this.refs.composedComponent && this.refs.composedComponent.validation );
    // use validation function from composedComponent if not provided in props

    let validationProperties;

    validation && ( validationProperties = validation(props) );

    // save all the componentKeys for shouldResetValidation
    validationProperties && ( this.componentKeys = _castArray(validationProperties).map(vP => vP.componentKey) );

    invariant(validation,
      `Could not find necessary "validation" function in either the props or ref of ` +
      `"${this.componentName}" for withValidation HOC.`
    );

    return validationProperties;
  };

  componentDidUpdate(prevProps, prevState) {
    const
      props = this.props,
      onValidation = this.props.onValidation || this.context.onValidation;

    if (props.shouldValidate) {
      onValidation && onValidation(this.getComponentValidationProperties());

    } else if (props.shouldResetValidation) {
      !_isEmpty(this.componentKeys) && onValidation && onValidation(this.componentKeys.map(componentKey => ({componentKey})));
    }
  }

  render() {
    const onValidation = this.props.onValidation || this.context.onValidation;
    if (this.canAttachRef) {
      return <ComposedComponent ref="composedComponent" {...this.props} onValidation={onValidation}/>
    }
    return <ComposedComponent {...this.props} onValidation={onValidation}/>
  }
};

export const withValidationDecorator = () => withValidation; // for es2015 class decorators "@withValidationDecorator"
export default withValidation;
