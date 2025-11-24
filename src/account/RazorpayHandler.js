import React from "react";
import { TouchableOpacity, Text } from "react-native";
import RazorpayCheckout from "react-native-razorpay";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BACKEND_URL = "https://whitecel.com/test"; 
const RAZORPAY_KEY = "rzp_live_eOcQFbvnC0tkjD"; // your key

export default function RazorpayHandler({ plan, amount }) {
  const handlePayment = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const resource = await AsyncStorage.getItem("sr");
      const name = (await AsyncStorage.getItem("name")) || "User";
      const email = (await AsyncStorage.getItem("mail")) || "test@email.com";

      if (!token) {
        alert("Session expired. Login again.");
        return;
      }

      // 1. CREATE ORDER
      const res = await axios.post(
        `${BACKEND_URL}/create_order`,
        {
          amount: amount,
          plan: plan,
          receipt: `receipt_${plan}`,
          resource: resource || "",
          currency: "INR",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const order_id = res.data?.order_id || res.data?.order?.id;
      if (!order_id) {
        alert("Unable to create order. Try later.");
        return;
      }

      // 2. START RAZORPAY CHECKOUT
      const options = {
        key: RAZORPAY_KEY,
        amount: amount,
        currency: "INR",
        name: "Whitecell",
        description: `Upgrade to ${plan} Plan`,
        order_id: order_id,
        prefill: {
          name: name,
          email: email,
          contact: "9999999999",
        },
        theme: {
          color: "#52c41a",
        },
      };

      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          // 3. VERIFY PAYMENT
          try {
            const verify = await axios.post(
              `${BACKEND_URL}/verify_payment`,
              {
                razorpay_order_id: paymentData.razorpay_order_id,
                razorpay_payment_id: paymentData.razorpay_payment_id,
                razorpay_signature: paymentData.razorpay_signature,
                plan: plan,
                amount: amount,
              },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (
              verify.data?.status === "Payment verified successfully" ||
              verify.data?.success
            ) {
              await AsyncStorage.setItem("subscription", plan);
              await AsyncStorage.setItem("expiry", verify.data?.expiry || "");

              alert("Payment Successful!");
            } else {
              alert("Payment verification failed.");
            }
          } catch (err) {
            console.log("Verify error:", err);
            alert("Payment verification error.");
          }
        })
        .catch((err) => {
          console.log("Razorpay Cancel/Error:", err);
          alert("Payment cancelled.");
        });
    } catch (err) {
      console.log("Order creation error:", err);
      alert("Something went wrong. Try again.");
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePayment}
      style={{
        marginTop: 16,
        backgroundColor: "#52c41a",
        padding: 12,
        borderRadius: 8,
      }}
    >
      <Text style={{ textAlign: "center", color: "#fff", fontWeight: "700" }}>
        Upgrade to {plan} Plan
      </Text>
    </TouchableOpacity>
  );
}
