import { Icon } from '@iconify/react';
import { useSnackbar } from 'notistack';

import twitterFill from '@iconify/icons-eva/twitter-fill';
import linkedinFill from '@iconify/icons-eva/linkedin-fill';
import facebookFill from '@iconify/icons-eva/facebook-fill';
import instagramFilled from '@iconify/icons-ant-design/instagram-filled';
// material
import { Stack, Card, TextField, InputAdornment, Button } from '@mui/material';
// redux
import { useSelector } from '../../../../redux/store';
// utils
import fakeRequest from '../../../../utils/fakeRequest';

// ----------------------------------------------------------------------

const SOCIAL_LINKS_OPTIONS = [
  {
    value: 'facebookLink',
    icon: <Icon icon={facebookFill} height={24} />
  },
  {
    value: 'instagramLink',
    icon: <Icon icon={instagramFilled} height={24} />
  },
  {
    value: 'linkedinLink',
    icon: <Icon icon={linkedinFill} height={24} />
  },
  {
    value: 'twitterLink',
    icon: <Icon icon={twitterFill} height={24} />
  }
];

// ----------------------------------------------------------------------

export default function AccountSocialLinks() {
  const { enqueueSnackbar } = useSnackbar();
  const { myProfile } = useSelector((state) => state.user);




  return (
    <Card sx={{ p: 3 }}>

      <Stack spacing={3} sx={{
        alignItems: "flex-end"
      }}>
        {SOCIAL_LINKS_OPTIONS.map((link) => (
          <div>
          <TextField>Teste</TextField>
          <TextField>Teste</TextField>
          </div>
        ))}

        <Button type="submit" variant="contained" 
        //loading={isSubmitting}
        
        >
          Save Changes
        </Button>
      </Stack>

    </Card>
  );
}
