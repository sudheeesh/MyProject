import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import Toast from 'react-native-toast-message';
import axios from 'axios';
import { apiRoutes } from '../utils/apiRoutes';

const AddUserScreen = ({ navigation }) => {
  const [role, setRole] = useState('user');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!username || !password) {
      Toast.show({ type: 'error', text1: 'All fields are required' });
      return;
    }

    try {
      setLoading(true);
      const body = {
        username,
        hashed_password: Buffer.from(password).toString('base64'),
        role,
        mail: username,
        resource: 'csp-test',
      };

      const res = await axios.post(apiRoutes.createUser, body);
      Toast.show({ type: 'success', text1: res.data.message || 'User created!' });
      navigation.goBack();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to create user' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <Text className="text-2xl font-bold mb-6">Add User</Text>

      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        className="border border-gray-300 rounded-lg px-4 py-3 mb-4"
      />

      <TouchableOpacity
        onPress={handleAddUser}
        disabled={loading}
        className="bg-blue-500 py-3 rounded-lg"
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text className="text-white text-center font-semibold">Submit</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default AddUserScreen;