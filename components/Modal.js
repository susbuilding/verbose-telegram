import React, { Component } from 'react';
import { Modal, Text, TouchableHighlight, View, TextInput, Button, Alert, Picker } from 'react-native';
import ActionButton from 'react-native-action-button';

export class ModalExample extends Component {

  constructor(props) {
    super(props);
    this.state = {
      modalVisible: false,
      query: '',
      favorites: [],
      cities: [],
      coordinates: [],
      selectedCity: '',
      currentWeatherSummary: '',
      currentWeatherTemp: '',
      currentCityName: '',
      favoritesWeather: [],
    }
  }

  setModalVisible = (visible) => {
    this.setState({modalVisible: visible});
  }

  onPickerSelect = (itemValue, itemIndex) => {
    console.log('selected', this.state.selectedCity)
    this.setState({selectedCity: itemValue})
  }

  _handleInputSubmit = () => {
      /** Request Google Places autocomplete results based on query term */
      return fetch(`https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${this.state.query}&key=AIzaSyCfLu47eF20R0D4qywviXakmNhJteD-gr8&types=(cities)`)
      .then((res) => res.json())
      .then((resJson) => {
        return resJson.predictions
      })
      .then((predictions) => {
        /** Set the city results onto state for later use with Picker tool*/
        predictions.forEach(city => {
          this.setState({cities: [...this.state.cities, city]})
        })

        /** if user chooses first option from cities Picker, set place_id from there */
        this.state.selectedCity ? null : this.setState({selectedCity: this.state.cities[0].place_id});
      })
      .catch( e =>
        console.error(e)
      );
  }

  _handleWeather = () => {
    /** Request location data based on the current selected city from Picker */
    return fetch(`https://maps.googleapis.com/maps/api/place/details/json?placeid=${this.state.selectedCity}&key=AIzaSyCfLu47eF20R0D4qywviXakmNhJteD-gr8`)
    .then((res) => res.json())
    .then((resJson) => {
      return resJson.result
    })
    .then((result) => {
      /** Add selected city to this.state favorites array */
      this.setState({
        favorites: [...this.state.favorites, result],
        coordinates: [result.geometry.location.lat, result.geometry.location.lng],
        currentCityName: result.formatted_address,
      });
    })
    .then(() => {
      /** Request weather based on coordinates of new favorite city */
      return fetch(`https://api.darksky.net/forecast/2ab31767237533457d88e5dc3c0bce0b/${this.state.coordinates[0]},${this.state.coordinates[1]}`)
    })
    .then((res) => res.json())
    .then((resJson) => {
      this.setState({
        currentWeatherSummary: resJson.currently.summary,
        currentWeatherTemp: resJson.currently.temperature,
        modalVisible: false})
    })
    .then(() => {
      /** Request weather for all favorites */
      let faveCities = this.state.favorites;
      let favoriteCoordinates = faveCities.map(city => { return [city.geometry.location.lat, city.geometry.location.lng]})

      console.log('here in favorites', favoriteCoordinates)
      return favoriteCoordinates.map(coordinate => {
        return fetch(`https://api.darksky.net/forecast/2ab31767237533457d88e5dc3c0bce0b/${coordinate[0]},${coordinate[1]}`)
      })
    })
    // .then((resArray) => {
    //   /** Results for each favorite in an array */
    //   //TODO: Stuck here. The results array after fetching data does not map into a useable json format
    //   console.log('res', resArray)
    //   resArray = resArray.map(res => res.json())
    // })
    .catch( e =>
        console.error(e)
    );
  }

  render() {
    return (
      <View style={{marginTop: 22}}>
        <Modal
          animationType={"slide"}
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {alert("Modal has been closed.")}}
          >
         <View style={{marginTop: 22}}>
          <View>
            <TextInput
              style={{height: 40, borderColor: 'gray', borderWidth: 1}}
              placeholder='Enter City Here'
              onChangeText={(query) => this.setState({query})}
              value={this.state.query}
              onSubmitEditing={this._handleInputSubmit}
              clearButtonMode='while-editing'
            />

            <Picker
              selectedValue={this.state.selectedCity}
              onValueChange={this.onPickerSelect}>
              {this.state.cities && this.state.cities.map(city => { return <Picker.Item
                      key={city.place_id}
                      label={city.description}
                      value={city.place_id}
                    />
                })
              }
            </Picker>

            <Button
              title="Add to Favorites"
              onPress={this._handleWeather}
            />

            <TouchableHighlight onPress={() => {
              this.setModalVisible(!this.state.modalVisible)
            }}>
              <Text>Back</Text>
            </TouchableHighlight>
          </View>
         </View>
        </Modal>

        <ActionButton
          buttonColor="rgba(231,76,60,1)"
          onPress={() => {
            this.setModalVisible(true)
          }}
        />

        {this.state.currentWeatherSummary ?
          <Text>
            {`${this.state.currentCityName}: ${this.state.currentWeatherSummary} ${this.state.currentWeatherTemp}`}
          </Text>
          : null
        }

      </View>
    );
  }
}
