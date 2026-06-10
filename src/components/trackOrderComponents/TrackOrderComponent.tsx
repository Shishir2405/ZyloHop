import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet} from 'react-native';
// import { Ionicons } from "@expo/vector-icons"; // or react-native-vector-icons

const TrackOrderComponent = ({time}: {time: string}) => {
  const [status, setStatus] = useState('Dispatched');
  const [timeLeft, setTimeLeft] = useState(10);

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 60000); // decrease every 1 minute
    return () => clearInterval(timer);
  }, []);

  const steps = ['Confirmation', 'Preparing', 'Dispatched', 'Delivered'];

  return (
    <View style={styles.container}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Out for delivery ...</Text>
        <View style={styles.timeRow}>
          {/* <Ionicons name="time-outline" size={20} color="white" /> */}
          <Text style={styles.timeText}>{timeLeft} mins</Text>
        </View>
        <Text style={styles.subText}>
          Your order is out for delivery. Monitor driver on the map
        </Text>
      </View>

      {/* Status Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => {
          const isCompleted =
            steps.indexOf(status) > index ||
            steps.indexOf(status) === steps.length - 1;
          const isActive = step === status;

          return (
            <View key={index} style={styles.stepItem}>
              <View
                style={[
                  styles.circle,
                  isCompleted && styles.circleCompleted,
                  isActive && styles.circleActive,
                ]}>
                {isCompleted ? (
                  //   <Ionicons name="checkmark" size={16} color="white" />
                  <></>
                ) : (
                  <Text style={styles.circleText}>{index + 1}</Text>
                )}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  isCompleted || isActive ? {color: 'green'} : {color: '#aaa'},
                ]}>
                {step}
              </Text>
              {index < steps.length - 1 && (
                <View
                  style={[
                    styles.line,
                    isCompleted || isActive ? {backgroundColor: 'green'} : {},
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

export default TrackOrderComponent;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#F4A300', // yellow/orange background
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'white',
    marginLeft: 6,
  },
  subText: {
    fontSize: 13,
    color: 'white',
    textAlign: 'center',
  },
  stepsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 16,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#aaa',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    zIndex: 1,
  },
  circleActive: {
    borderColor: 'green',
    backgroundColor: 'green',
  },
  circleCompleted: {
    backgroundColor: 'green',
    borderColor: 'green',
  },
  circleText: {
    color: '#aaa',
    fontSize: 12,
    fontWeight: '500',
  },
  stepLabel: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  line: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#aaa',
    zIndex: 0,
  },
});
