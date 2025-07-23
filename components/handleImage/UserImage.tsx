import { Image } from '@chakra-ui/react';

const UserImage = ({ imageUrl, width, height, objectFit = "cover" }) => {
    const defaultProfilePicture = "/account.png";
    const profilePicture = imageUrl && !imageUrl.toLowerCase().includes("null")
      ? imageUrl
      : defaultProfilePicture;

    return (
      <Image
        src={profilePicture}
        alt="Profile"
        w={width}
        h={height}
        objectFit={objectFit}
        borderRadius="50%"
      />
    );
  };

  export default UserImage