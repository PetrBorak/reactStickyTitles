/* global describe, it */
import React from 'react';
import expect from 'expect';
import { FormItem, FormSubmit } from '@dc/ui-library';
import Form, {
  __RewireAPI__ as FormRewireAPI
} from './Form';
import {
  setupConnectInParalelWithStore
}
  from '../../utils/testsUtils';

const storeFormData = expect.createSpy();
const submitFormData = expect.createSpy();

let forms = {
  1: {
    formData: {
      itemName: 'data'
    }
  }
};

function setupFormComponent() {
  return setupConnectInParalelWithStore(Form, {
    formId: 1,
    forms,
    storeFormData,
    submitFormData,
    clearOnSubmit: true
  },
    [
      <FormItem name="itemName" />,
      <FormSubmit
        name="submitName"
        messageSuccess="testMessageSuccess"
      />
    ]

  );
}

describe('Form initialization', () => {
  describe('Renders properly', () => {
    it('Renders the children', () => {
      const { wrapper } = setupFormComponent();
      expect(wrapper.find('.dc-form-item').length).toBe(2);
    });
    it('Renders the form tag', () => {
      const { wrapper } = setupFormComponent();
      expect(wrapper.find('form').length).toBe(1);
    });
  });
});

describe('Form functionality', () => {
  it('Calls the submit form data action creator', () => {
    const { wrapper } = setupFormComponent();
    wrapper.find('form').simulate('submit');
    expect(submitFormData).toHaveBeenCalled();
  });

  it('Updates the form submits', () => {
    const { wrapper } = setupFormComponent();
    const props = Object.assign({}, { forms: { ...forms } });

    Object.assign(props.forms[1], {
      success: true,
      processing: false
    });

    const spy = expect.spyOn(wrapper.find('Form').at(0).node, 'updateSubmits').andCallThrough();
    wrapper.find('form').simulate('submit');

    wrapper.setProps(props);

    expect(spy).toHaveBeenCalled();
  });

  it('Updates the form submits when failure occurs', () => {
    forms = {
      1: {
        formData: {
          itemName: 'data'
        },
        success: false,
        processing: false,
        formMessages: [
          'password_submit_failure',
          'password_submit_failure',
          'password_submit_failure'
        ]
      }
    };

    // eslint-disable-next-line no-underscore-dangle
    FormRewireAPI.__Rewire__('translations', {
      password_submit_failure: 'fillerText'
    });

    const { wrapper } = setupFormComponent();
    wrapper.find('form').simulate('submit');
    wrapper.setProps(forms);

    expect(wrapper.find('form').html()).toInclude('fillerText');

    // eslint-disable-next-line no-underscore-dangle
    FormRewireAPI.__ResetDependency__('translations');
  });

  it('updates the form submits when change occurs without the form being submitted', () => {
    forms = {
      1: {
        formData: {
          itemName: 'data'
        },
        success: false,
        processing: false,
        formMessages: [
          'password_submit_success'
        ]
      }
    };

    const { wrapper } = setupFormComponent();
    const spy = expect.spyOn(wrapper.find('Form').at(0)
      .node, 'updateSubmitsDisabledState')
      .andCallThrough();

    wrapper.setProps(forms);

    expect(spy).toHaveBeenCalled();
  })
});
