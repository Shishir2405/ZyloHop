import { ScrollView, StyleSheet, TouchableOpacity, View, TextInput } from "react-native"
import CustomText from "./CustomText"
import Modal from 'react-native-modal'
import { SVG } from "./SvgHelper"
import { Font } from "./Theam";
import Button from "./Button";
import { useState } from "react";



interface FilterProps {
    isVisible: boolean;
    closemodal: () => void;
}

const Filter: React.FC<FilterProps> = ({ isVisible, closemodal }) => {
    const [activeButton, setactiveButton] = useState<string>('veg')

    return (
        <Modal
            testID={'modal'}
            isVisible={isVisible}
            onBackButtonPress={closemodal}
            onBackdropPress={closemodal}
            style={styles.modalView}
        >
            <View style={{ flex: 1, backgroundColor: "#FFF" }}>
                <TouchableOpacity style={styles.closebutton} onPress={closemodal}>
                    <SVG.Blackcross />
                </TouchableOpacity>

                <ScrollView style={{ flex: 1, paddingHorizontal: 15 }}>
                    <View style={styles.filterview}>
                        <CustomText style={styles.filtertext}>
                            Filter
                        </CustomText>
                        <TouchableOpacity>
                            <CustomText style={styles.resetText}>
                                Reset all
                            </CustomText>
                        </TouchableOpacity>
                    </View>
                    <CustomText style={styles.rangheading}>Restaurant nearby</CustomText>
                   
                    <View style={styles.filterview}>
                        <CustomText style={styles.rangevalue}>0km</CustomText>
                        <CustomText style={styles.rangevalue}>10km</CustomText>
                    </View>
                    <SVG.Range width={350} bottom={10}/>


                    <CustomText style={styles.rangheading}>Price range</CustomText>
                    <View style={styles.filterview}>

                        <TextInput style={styles.inputbox} placeholder="Min" maxLength={5} keyboardType="numeric" />
                        <TextInput style={styles.inputbox} placeholder="Max" maxLength={5} keyboardType="numeric" />
                    </View>



                    <View style={styles.filterview}>
                        <CustomText style={styles.rangevalue}>$0</CustomText>
                        <CustomText style={styles.rangevalue}>$10B</CustomText>
                    </View>
                    <SVG.Range width={350} bottom={10}/>



                    <CustomText style={styles.rangheading}>Restaurant type</CustomText>

                    <View style={[styles.filterview, { backgroundColor: "#F2F4F7", borderRadius: 25 }]}>
                        <TouchableOpacity style={[styles.touchbutton, {
                            backgroundColor: activeButton == 'veg' ? "#EDAE10" : "#F2F4F7",


                        }]} onPress={() => setactiveButton('veg')}>
                            <CustomText style={[styles.butttontext, {
                                color: activeButton == 'veg' ? "#000000" : '#98A0B4'
                            }]}>Veg</CustomText>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.touchbutton, {
                            backgroundColor: activeButton == 'nonveg' ? "#EDAE10" : "#F2F4F7"
                        }]} onPress={() => setactiveButton('nonveg')}>
                            <CustomText style={[styles.butttontext, {
                                color: activeButton == 'nonveg' ? "#000000" : '#98A0B4'
                            }]}>
                                Non Veg
                            </CustomText>
                        </TouchableOpacity>
                    </View>

                    <CustomText style={styles.rangheading}>Restaurant rating</CustomText>
                    <SVG.FeedbackStars marginTop={10} />


                </ScrollView>
                <View style={{ paddingHorizontal: 15 }}>
                    <Button buttonName="Apply" onPress={closemodal}/>
                </View>


            </View>
        </Modal>

    )
}
export default Filter

const styles = StyleSheet.create({
    butttontext: {
        fontSize: 14, fontFamily: Font.textSemiBolder
    },
    touchbutton: {
        alignItems: "center", justifyContent: "center", height: 50, width: '50%', borderRadius: 25
    },
    inputbox: {
        borderWidth: 1,
        borderColor: '#A0A0A0',
        height: 50,
        width: '47%',
        flexDirection: 'row',
        borderRadius: 8,
        marginVertical: 10, padding: 10
    },
    rangevalue: {
        color: "#EDAE10", fontSize: 12, fontFamily: Font.textSemiBolder
    },
    rangheading: {
        color: "#4B4B4B", fontSize: 14, fontFamily: Font.textSemiBolder
    },
    resetText: {
        color: "#6B6B6B", fontSize: 14, fontFamily: Font.textSemiBolder
    },
    filtertext: {
        color: "#101010", fontSize: 20, fontFamily: Font.textSemiBolder
    },
    filterview: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginVertical: 15
    },
    closebutton: {
        alignSelf: "flex-end", padding: 15
    },
    modalView: {
        justifyContent: 'flex-end',
        margin: 0,

    },
})