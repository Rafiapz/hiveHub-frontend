import { FC } from "react";

declare global {
   interface Window {
      Razorpay: any; // or specify the exact type if available
   }
}

const RenderRazorpay: FC<any> = ({}) => {
   var options = {
      key: "rzp_test_n7T0wcONYZwk3H",
      amount: "69900",
      currency: "INR",
      name: "hiveHub",
      description: "Test Transaction",
      image: "https://example.com/your_logo",
      order_id: "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
      handler: function (response: any) {
         alert(response.razorpay_payment_id);
         alert(response.razorpay_order_id);
         alert(response.razorpay_signature);
      },
      prefill: {
         //We recommend using the prefill parameter to auto-fill customer's contact information, especially their phone number
         name: "Gaurav Kumar", //your customer's name
         email: "gaurav.kumar@example.com",
         contact: "9000090000", //Provide the customer's phone number for better conversion rates
      },
      notes: {
         address: "Razorpay Corporate Office",
      },
      theme: {
         color: "#3399cc",
      },
   };
   var rzp1 = new window.Razorpay(options);
   rzp1.open();

   return <div></div>;
};

export default RenderRazorpay;
