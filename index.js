/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import app from './app.config';
import './i18n'; // for translation option

AppRegistry.registerComponent(app.name, () => App);
