import { Button } from '@chakra-ui/react';
import { useDispatch, useSelector } from 'react-redux';
import { followUser } from '../../redux/slices/UserSlice';

export default function FollowButton({ user }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.data);

  // Early return if no user data
  if (!user || !currentUser) {
    return null;
  }

  // Check if the current user is viewing their own profile
  if (user.email === currentUser.email) {
    return null;
  }

  const isFollowing = currentUser.profile?.following?.find(
    (followingId) => followingId === user._id
  );

  const handleFollow = () => {
    dispatch(
      followUser({
        email: user.email,
        currentUserEmail: currentUser.email,
      })
    );
  };

  return (
    <Button
      colorScheme={isFollowing ? 'red' : 'green'}
      onClick={handleFollow}
      mb={4}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
}
