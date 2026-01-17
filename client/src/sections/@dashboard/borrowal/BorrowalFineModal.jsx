import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography
} from "@mui/material";
import PropTypes from "prop-types";
import axios from "axios";
import toast from "react-hot-toast";
import { useState } from "react";
import { apiUrl, methods, routes } from "../../../constants";

const BorrowalFineModal = ({ open, onClose, borrowal, refresh }) => {
  const [loading, setLoading] = useState(false);

  const payFine = async () => {
    if (!borrowal?._id) return;

    setLoading(true);
    try {
      await axios.put(apiUrl(routes.BORROWAL, methods.PAY_FINE, borrowal._id));
      toast.success("Fine paid successfully");
      onClose();
      refresh();
    } catch {
      toast.error("Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Pay Fine</DialogTitle>
      <DialogContent>
        <Typography>
          Pay fine of ₹{borrowal?.fineAmount || 0} for{" "}
          {borrowal?.member?.name || "Unknown Member"}.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={payFine} disabled={loading}>
          {loading ? "Processing..." : "Pay Fine"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

BorrowalFineModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  borrowal: PropTypes.object,
  refresh: PropTypes.func.isRequired
};

export default BorrowalFineModal;
