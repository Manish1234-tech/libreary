import PropTypes from "prop-types";
import { Dialog, DialogActions, DialogTitle, Button } from "@mui/material";

const BorrowalDialog = ({ open, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>
      Are you sure you want to delete this borrowal?
    </DialogTitle>

    <DialogActions>
      <Button onClick={onClose}>Cancel</Button>
      <Button color="error" onClick={onConfirm}>
        Delete
      </Button>
    </DialogActions>
  </Dialog>
);

/* ✅ PROPS VALIDATION */
BorrowalDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default BorrowalDialog;
