import { Paper, styled } from '@mui/material'

const SettingsBox = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.primary
}))

export default SettingsBox
