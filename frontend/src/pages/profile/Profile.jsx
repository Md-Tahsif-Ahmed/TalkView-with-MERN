import { Avatar, Box, Text, Divider, Flex, Heading } from '@chakra-ui/react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ProfilePostList from '../../components/card/ProfilePostList';
import FollowButton from '../../components/custom/FollowButton';
import FollowStats from '../../components/text/FollowStats';
import usePosts from '../../hooks/usePosts';
import useProfile from '../../hooks/useProfile';
import { loadPosts, selectAllPosts } from '../../redux/slices/FeedSlice';
import { motion } from 'framer-motion';
import { fadeInAnimation } from '../../lib/animations';

export default function Profile() {
  const { onid } = useParams();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.data);
  const profile = useProfile({ onid });
  const allPosts = useSelector(selectAllPosts)?.filter(
    (post) => post.postedBy.split('@')[0].toString() === onid.toString(),
  );

  useEffect(() => {
    document.querySelector('title').innerHTML = `${onid}'s Profile`;

    return () => {
      document.querySelector('title').innerHTML = 'Talk2Beavs - OSU CS494';
    };
  }, [onid]);

  useEffect(() => {
    dispatch(loadPosts());
  }, [dispatch]);

  // Early return if profile data is not loaded yet
  if (!profile || !profile.user) {
    return null;
  }

  const profileData = profile.user;
  const displayName = profileData.name || onid;
  const isFacebookUser = onid.startsWith('fb_');

  return (
    <Box w='100%' h='100%' py={8}>
      <Flex
        direction='column'
        align='center'
        justify='center'
        w='100%'
        h='100%'
        as={motion.div}
        animation={fadeInAnimation}
      >
        <Avatar 
          size='2xl' 
          name={displayName} 
          src={profileData.profile?.avatar} 
          mb={4} 
        />
        <FollowButton user={profileData} />
        <Heading as='h1' size='2xl' mb={4}>
          {displayName}
        </Heading>
        {isFacebookUser && (
          <Text color="gray.500" mb={2}>
            Facebook User
          </Text>
        )}
        <Box my={4} maxW='40%' textAlign='center'>
          {profileData.standing && profileData.major && (
            <Box mb={4}>
              <Text>
                {profileData.standing} in {profileData.major}
              </Text>
            </Box>
          )}
          {profileData.profile?.bio && (
            <Box mb={4}>
              <Text fontStyle='italic'>"{profileData.profile.bio}"</Text>
            </Box>
          )}
        </Box>
        <Divider
          w={{
            base: '50%',
            sm: '60%',
            md: '50%',
            lg: '55%',
          }}
          mb={4}
        />

        <FollowStats onid={onid} user={user} />

        <Divider
          w={{
            base: '50%',
            sm: '60%',
            md: '50%',
            lg: '55%',
          }}
          mb={4}
        />
        <Heading as='h2' size='lg' mt={8} mb={4}>
          {displayName}'s Posts
          <Divider mt={2} />
        </Heading>

        <ProfilePostList posts={allPosts} />
      </Flex>
    </Box>
  );
}
