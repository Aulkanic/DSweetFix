/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, Input, Button, message } from 'antd';
import { signInWithEmailAndPassword } from 'firebase/auth';
import DSweetBg from '../../../assets/bg.png';
import { auth, db } from '../../../db';
import { collection, getDocs, query, where } from 'firebase/firestore';

export const LoginPage = () => {
    const onFinish = async (values: { Username: any; password: any; }) => {
        try {
          const { Username, password } = values;
            console.log(values)
          // Query Firestore for the user document with the given username
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('username', '==', Username));
          const querySnapshot = await getDocs(q);
    
          if (querySnapshot.empty) {
            message.error('User not found!');
            return;
          }
    
          // Assume usernames are unique, so get the first document
          const userDoc = querySnapshot.docs[0];

          const userData = userDoc.data();
          console.log(userData)
          // Check if the retrieved email is valid
          if (!userData.email || !userData.email.includes('@')) {
            throw new Error('Invalid email format');
          }
    
          // Use the associated email to sign in with Firebase Authentication
          const userCredential = await signInWithEmailAndPassword(auth, userData.email, password);
          console.log(userCredential)
          message.success('Login successful!');
          console.log('User data:', userData);
    
          // Additional logic, like redirecting the user, can go here
        } catch (error) {
          console.error('Login failed:', error);
          message.error('Login failed! Please check your username and password.');
        }
    };
    

  return (
    <div className="flex min-h-screen justify-end" style={{
        backgroundImage: `url(${DSweetBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        flex: 1
      }}>
      {/* Login Form with Wave Effect on Left */}
      <div className="relative w-full md:w-[60%] h-screen p-10 flex overflow-hidden">
        <div className='absolute top-8 left-36 text-left'>
            <p className='font-grand-hotel text-8xl text-white'>D’ Sweet Fix</p>
            <p className='text-white text-xl pl-8'>BAKING & CONFECTIONERY SHOP</p>
        </div>
        <div className="absolute bottom-12 left-36 w-[60%] h-[65%] mx-auto p-8">
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            layout='vertical'
            className='w-full h-full'
          >
            <Form.Item
              name="Username"
              label={<p className='text-white text-2xl'>Username</p>}
              rules={[{ required: true, message: 'Please enter your username!' }]}
            >
              <Input placeholder="Enter your username" />
            </Form.Item>
            <Form.Item
              name="password"
              label={<p className='text-white text-2xl'>Password</p>}
              rules={[{ required: true, message: 'Please enter your password!' }]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" className='bg-black w-full' htmlType="submit">
                Sign In
              </Button>
            </Form.Item>
            <p className='w-full text-center text-white'>© 2024</p>
          </Form>
        </div>
      </div>
    </div>
  );
};
