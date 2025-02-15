import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Text,
  useColorMode,
  useColorModeValue,
  useMediaQuery,
  Select,
} from '@chakra-ui/react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ttb from '../../assets/logo.png';
import { slideAnimation } from '../../lib/animations';

const BASE_URL = import.meta.env.VITE_APP_PROD_BACKEND_URL;

if (!BASE_URL) throw new Error('Missing backend URL');

function Signup() {
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState('');
  const navigate = useNavigate();
  const [isMobile] = useMediaQuery('(max-width: 768px)');
  const { colorMode } = useColorMode();
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('');
  const [preferredPartner, setPreferredPartner] = useState('');
  const [educationLevel, setEducationLevel] = useState('');
  const [englishLevel, setEnglishLevel] = useState('');
  const [learningPurpose, setLearningPurpose] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (step === 1) {
      if (name === '' || email === '' || password === '' || phoneNumber === '' || 
          gender === '' || preferredPartner === '') {
        setIsLoading(false);
        setError('Please fill in all fields');
        return;
      }
      setStep(2);
      setIsLoading(false);
      return;
    }

    if (step === 2) {
      if (educationLevel === '' || englishLevel === '' || learningPurpose === '') {
        setIsLoading(false);
        setError('Please fill in all fields');
        return;
      }

      const data = {
        email,
        name,
        password,
        phoneNumber,
        gender,
        preferredPartner,
        educationLevel,
        englishLevel,
        learningPurpose,
      };

      try {
        const res = await axios.post(`${BASE_URL}/api/auth/register`, data);

        if (res.status === 201) {
          setTimeout(() => {
            setError('');
            setIsLoading(false);

            setResponse('Signup successful!');
          }, 1000);
          setTimeout(() => {
            navigate('/login');
            setIsLoading(false);
          }, 2000);
        } else {
          setError('Signup failed');
          setTimeout(() => {
            setIsLoading(false);
          }, 1000);
        }
      } catch (err) {
        console.error(err.response.data.message);
        setIsLoading(false);
        if (err.response.data.message === 'User already exists') {
          setError('User already exists');
        } else if (
          err.response.data.message.substring(err.response.data.message.length - 71) ===
          'fails to match the required pattern: ^[a-zA-Z0-9._%+-]+@oregonstate.edu$'
        ) {
          setError('Please use your Oregon State email');
        } else {
          setError('Signup failed');
        }
      }
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleSubmit}>
      <Input
        variant='filled'
        mb={3}
        type='email'
        _active={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        _focus={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        autoComplete='email'
        _placeholder={{
          color: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        placeholder='Email'
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        variant='filled'
        mb={3}
        _active={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        _focus={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        type='text'
        _placeholder={{
          color: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        autoComplete='name'
        placeholder='Name'
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Input
        variant='filled'
        mb={3}
        _active={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        _focus={{
          borderColor: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        type='password'
        autoComplete='current-password'
        _placeholder={{
          color: colorMode === 'light' ? '#f2a673' : '#DE6A1F',
        }}
        placeholder='Password'
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        variant='filled'
        mb={3}
        type='tel'
        placeholder='Phone Number'
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
      />
      <Select
        variant='filled'
        mb={3}
        placeholder='Gender'
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      >
        <option value='male'>Male</option>
        <option value='female'>Female</option>
        <option value='other'>Other</option>
      </Select>
      <Select
        variant='filled'
        mb={3}
        placeholder='Preferred Speaking Partner'
        value={preferredPartner}
        onChange={(e) => setPreferredPartner(e.target.value)}
      >
        <option value='any'>Any</option>
        <option value='male'>Male</option>
        <option value='female'>Female</option>
      </Select>
      <Button
        width='full'
        mt={4}
        type='submit'
        isLoading={isLoading}
      >
        Next
      </Button>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleSubmit}>
      <Select
        variant='filled'
        mb={3}
        placeholder='Education Level'
        value={educationLevel}
        onChange={(e) => setEducationLevel(e.target.value)}
      >
        <option value='school'>School Student</option>
        <option value='college'>College Student</option>
        <option value='university'>University Student</option>
        <option value='job'>Job Seeker/Holder</option>
      </Select>
      <Select
        variant='filled'
        mb={3}
        placeholder='English Proficiency Level'
        value={englishLevel}
        onChange={(e) => setEnglishLevel(e.target.value)}
      >
        <option value='beginner'>Beginner</option>
        <option value='intermediate'>Intermediate</option>
        <option value='advanced'>Advanced</option>
      </Select>
      <Select
        variant='filled'
        mb={3}
        placeholder='Learning Purpose'
        value={learningPurpose}
        onChange={(e) => setLearningPurpose(e.target.value)}
      >
        <option value='ielts'>IELTS</option>
        <option value='study_abroad'>Study Abroad</option>
        <option value='job'>Job</option>
        <option value='personal'>Personal Improvement</option>
      </Select>
      <Button
        width='full'
        mt={4}
        type='submit'
        isLoading={isLoading}
      >
        Submit
      </Button>
    </form>
  );

  return (
    <Flex
      direction='column'
      align='center'
      justify='center'
      minH={isMobile ? 'calc(100vh - 80px)' : '100vh'}
      bg={useColorModeValue('gray.50', 'inherit')}
    >
      <Box
        as={motion.div}
        animation={slideAnimation}
        p={8}
        maxWidth={isMobile ? '80%' : '40%'}
        borderWidth={1}
        borderRadius={8}
        borderColor={useColorModeValue('orange.300', 'orange.500')}
        boxShadow='2xl'
        shadow={useColorModeValue('lg', 'dark-lg')}
        bg={useColorModeValue('white', 'gray.800')}
        w='full'
      >
        <Box textAlign='center' align='center' justify='center' mb={12}>
          <Image
            src={ttb}
            alt='logo'
            width='100%'
            maxH={isMobile ? '100px' : '200px'}
            objectFit='contain'
          />
          <Heading
            as='h1'
            size='2xl'
            fontWeight='bold'
            textShadow={colorMode === 'light' ? '2px 2px #DE6A1F' : '2px 2px #f2a673'}
            color={colorMode === 'light' ? '#f2a673' : '#DE6A1F'}
          >
            {' '}
            Sign Up
          </Heading>
        </Box>
        <Box my={4} textAlign='left'>
          {step === 1 ? renderStep1() : renderStep2()}
        </Box>
        {error && (
          <Text mt={4} textAlign='center' color='red.500'>
            {error}
          </Text>
        )}
        {response && (
          <Text mt={4} textAlign='center' color='green.500'>
            {response}
          </Text>
        )}
        <Text mt={4} textAlign='center'>
          Already have an account?{' '}
          <Link style={{ color: '#DE6A1F' }} to='/login'>
            Login
          </Link>
        </Text>
      </Box>
    </Flex>
  );
}

export default Signup;
