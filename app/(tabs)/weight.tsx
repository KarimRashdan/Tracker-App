import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, Keyboard, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

interface WeightEntry {
  date: string;
  weight: string;
}

export default function WeightScreen() {
  const [weight, setWeight] = useState('');  // State for current weight input
  const [isExpanded, setIsExpanded] = useState(false);  // State for toggling expandable section
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);  // State to store weight entries

  // Load weight entries from AsyncStorage when the app starts
  useEffect(() => {
    const loadWeightEntries = async () => {
      try {
        const savedEntries = await AsyncStorage.getItem('weightEntries');
        if (savedEntries) {
          setWeightEntries(JSON.parse(savedEntries));
        }
      } catch (error) {
        console.error('Failed to load weight entries:', error);
      }
    };
    loadWeightEntries();
  }, []);

  // Save weight entries to AsyncStorage whenever they are updated
  const saveWeightEntries = async (entries: WeightEntry[]) => {
    try {
      await AsyncStorage.setItem('weightEntries', JSON.stringify(entries));
    } catch (error) {
      console.error('Failed to save weight entries:', error);
    }
  };

  const logWeight = () => {
    if (weight) {
      const newEntry = {
        date: new Date().toLocaleDateString(),
        weight: weight,
      };
      const updatedEntries = [...weightEntries, newEntry];
      setWeightEntries(updatedEntries);  // Add the new entry to the weight entries
      saveWeightEntries(updatedEntries);  // Save to AsyncStorage
      setWeight('');  // Reset input box to empty string 
      Keyboard.dismiss();
    }
  };

  const deleteEntry = (index: number) => {
    const updatedEntries = weightEntries.filter((_, i) => i !== index);  // Filter out the entry by index
    setWeightEntries(updatedEntries);  // Update the state with the new array
    saveWeightEntries(updatedEntries);  // Save the updated entries to AsyncStorage
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);  // Toggle the expand/collapse state
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}  // Adjust the behavior based on platform
    >
      <ScrollView contentContainerStyle={styles.scrollViewContainer}>
        <Text style={styles.title}>Log Your Weight</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter weight in kg"
          keyboardType="numeric"
          returnKeyType="done"
          value={weight}
          onChangeText={setWeight}
        />

        {/* Button to log weight */}
        <Button title="Log Weight" onPress={logWeight} />

        {/* Expandable Section */}
        <TouchableOpacity style={styles.expandableHeader} onPress={toggleExpand}>
          <Text style={styles.expandableTitle}>Weight History</Text>
          <Ionicons
            name={isExpanded ? 'chevron-up-outline' : 'chevron-down-outline'}  // Toggle arrow icon
            size={20}
            color="white"
          />
        </TouchableOpacity>

        {isExpanded && (
          <View style={styles.expandableContent}>
            {/* Map through the weightEntries array to display each logged entry */}
            {weightEntries.length > 0 ? (
              weightEntries.map((entry, index) => (
                <View key={index} style={styles.entry}>
                  <Text style={styles.entryText}>
                    {entry.date}: {entry.weight} kg
                  </Text>
                  {/* Button to delete entry */}
                  <TouchableOpacity onPress={() => deleteEntry(index)}>
                    <Ionicons name="trash-outline" size={20} color="red" />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.noEntries}>No entries yet</Text>
            )}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#1c1c1e',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    color: '#fff',
  },
  expandableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 15,
    borderRadius: 5,
    marginTop: 20,
  },
  expandableTitle: {
    fontSize: 16,
    color: 'white',
  },
  expandableContent: {
    backgroundColor: '#444',
    padding: 15,
    borderRadius: 5,
    marginTop: 10,
  },
  entry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  entryText: {
    color: 'white',
    fontSize: 16,
  },
  noEntries: {
    color: 'white',
    fontStyle: 'italic',
  },
  scrollViewContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});