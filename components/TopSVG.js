import Svg, { Path } from "react-native-svg";
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Dimensions,View } from 'react-native';


const TopSVG = ({
    SvgHeight
}) => {
   
  
    return (
        <View style={styles.svgContainer}>
        <Svg height={SvgHeight} style={{height:SvgHeight}} width="100%" viewBox="0 0 1440 320">
        <Path
           fill="#805500"
          d="M0,64L48,69.3C96,75,192,85,288,117.3C384,149,480,203,576,213.3C672,224,768,192,864,170.7C960,149,1056,139,1152,160C1248,181,1344,235,1392,261.3L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
        />
      </Svg>
      </View>
    );
  };
  
const styles = StyleSheet.create({
    svgContainer: {
        position: "absolute",
        top: 0,
        width: "100%",
       
      },
  });
  
  export default TopSVG;
  