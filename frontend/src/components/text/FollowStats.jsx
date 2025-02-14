import { Box, Divider, HStack, Text } from '@chakra-ui/react';
import useProfile from '../../hooks/useProfile';

export default function FollowStats({ onid, user }) {
  const profile = useProfile({ onid, user });

  // Early return with null if profile is not loaded
  if (!profile || !profile.user) return null;

  // Safely access followers and following arrays
  const followers = profile.user.profile?.followers || [];
  const following = profile.user.profile?.following || [];

  return (
    <HStack spacing={{ base: 36, sm: 12, md: 24, lg: 28 }}>
      <Box
        w={'8.5rem'}
        textAlign={'center'}
        _hover={{
          boxShadow: {
            base: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px',
          },
          transform: 'scale(1.05)',
          padding: '0.5rem',
          cursor: 'pointer',
          borderRadius: '0.5rem',
          bg: {
            base: 'orange.500',
          },
        }}
      >
        <Text fontSize='xl' fontWeight='bold'>
          Followers
        </Text>
        <Text fontSize='xl' fontWeight='bold'>
          {followers.length}
        </Text>
      </Box>

      <Divider orientation='vertical' h='100px' />

      <Box
        w={'8.5rem'}
        textAlign={'center'}
        transition={'all 0.3s ease-in-out'}
        _hover={{
          boxShadow: {
            base: 'rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px',
          },
          transform: 'scale(1.05)',
          padding: '0.5rem',
          cursor: 'pointer',
          borderRadius: '0.5rem',
          bg: {
            base: 'orange.500',
          },
        }}
      >
        <Text fontSize='xl' fontWeight='bold'>
          Following
        </Text>
        <Text fontSize='xl' fontWeight='bold'>
          {following.length}
        </Text>
      </Box>
    </HStack>
  );
}
