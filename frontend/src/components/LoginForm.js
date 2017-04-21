import React, { Component } from 'react';
import axios from 'axios';

export default class LoginForm extends Component {

    constructor(props) {
        super(props);

        this.state = {
            email: '',
            password: '',
        };
    }

    onOAuthClick(source) {
        const width = 600;
        const height = 450;
        const top = (window.outerHeight - height) / 2;
        const left = (window.outerWidth - width) / 2;

        const authWindow = window.open('http://localhost:9000/api/auth/' + source, '', 'width=' + width + ',height=' + height + ',scrollbars=0,top=' + top + ',left=' + left);
        
        const handleAuthEvent = e => {
            console.log(e.data);
            window.removeEventListener('message', handleAuthEvent);
            authWindow.close();
        }
        window.addEventListener('message', handleAuthEvent);
    }

    onFormSubmit(event) {
        event.preventDefault();
        // this.props.signInUser(this.state);
    }

    render() {
        return (
            <div className="container">
                <form onSubmit={this.onFormSubmit.bind(this)}>
                    <div className="form-group">
                    <label>email*</label>
                    <input type="text" value={this.state.email} onChange={event => this.setState({ email: event.target.value })}/>
                    </div>
                    <div className="form-group">
                    <label>password*</label>
                    <input type="password" value={this.state.password} onChange={event => this.setState({ password: event.target.value })}/>
                    </div>
                    <button type="submit" className="btn btn-primary">Submit</button>
                </form>
                <button onClick={this.onOAuthClick.bind(this, 'facebook')}>Facebook</button>
                <button onClick={this.onOAuthClick.bind(this, 'google')}>Google</button>
            </div>
        );
    }
}