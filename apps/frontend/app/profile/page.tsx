"use client";

import React, { useEffect, useState } from "react"; // Import React
import { useRouter } from "next/navigation";
import useToken from "@/hooks/useToken";
import {
    Container,
    Box,
    Typography,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
} from "@mui/material";

interface UserProfile {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    address: string;
}

const initialUserProfile: UserProfile = {
    firstName: "Test",
    lastName: "Account",
    phoneNumber: "1234567890",
    address: "Test Address",
};

const Profile: React.FC = () => {
    const router = useRouter();
    const { token, isChecking } = useToken();
    const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
    const [open, setOpen] = useState(false);
    const [currentField, setCurrentField] = useState<keyof UserProfile | null>(null);
    const [newValue, setNewValue] = useState<string>("");

    const fields: Array<keyof UserProfile> = ['firstName', 'lastName', 'phoneNumber', 'address'];

    useEffect(() => {
        if (!isChecking && !token) {
            router.push("/login");
        }
    }, [token, isChecking, router]);

    if (isChecking) return <Typography align="center">Checking authentication...</Typography>;

    if (!token) return null;

    const handleEditClick = (field: keyof UserProfile) => {
        setCurrentField(field);
        setNewValue(userProfile[field]);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSave = () => {
        if (currentField) {
            setUserProfile((prev) => ({
                ...prev,
                [currentField]: newValue,
            }));
        }
        handleClose();
    };

    return (
        <Container maxWidth="sm" sx={{ height: '100vh' }}>
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                sx={{ height: '100%', width: '100%' }} // Full height and width
            >
                {fields.map((field) => (
                    <Box key={field} display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', marginY: 1 }}>
                        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
                        <Typography variant="body1" sx={{ flex: 1, textAlign: 'center' }}>{userProfile[field]}</Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={() => handleEditClick(field)}
                            sx={{ width: '100px', flexShrink: 0 }}
                        >
                            Edit
                        </Button>
                    </Box>
                ))}
            </Box>

            {/* Dialog for editing user profile */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit {currentField}</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label={currentField}
                        type="text"
                        fullWidth
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSave} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile;
