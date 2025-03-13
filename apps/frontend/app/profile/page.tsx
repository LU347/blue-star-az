"use client";

import React, { useEffect, useState } from "react";
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
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@mui/material";

interface UserProfile {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
    branch: string;
    gender: string;
    addressLineOne?: string;
    addressLineTwo?: string;
    zipCode?: string;
    city?: string;
    country?: string;
}

const initialUserProfile: UserProfile = {
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    branch: "",
    gender: "",
};

const branchOptions = ["ARMY", "NAVY", "AIR_FORCE", "SPACE_FORCE", "COAST_GUARD", "NATIONAL_GUARD", "MARINES"];
const genderOptions = ["MALE", "FEMALE"];

const Profile: React.FC = () => {
    const router = useRouter();
    const { token, isChecking } = useToken();
    const [userProfile, setUserProfile] = useState<UserProfile>(initialUserProfile);
    const [open, setOpen] = useState(false);
    const [currentField, setCurrentField] = useState<keyof UserProfile | null>(null);
    const [newValue, setNewValue] = useState<string>("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validateField = (field: keyof UserProfile, value: string) => {
        if (field === 'email' && value && !/\S+@\S+\.\S+/.test(value)) {
            return 'Invalid email format';
        }
        if (field === 'phoneNumber' && value && !/^\d{10}$/.test(value)) {
            return 'Phone number must be 10 digits';
        }
        return '';
    };

    const accountFields: Array<keyof UserProfile> = ['firstName', 'lastName', 'phoneNumber', 'email'];
    const personalFields: Array<keyof UserProfile> = ['branch', 'gender', 'addressLineOne', 'addressLineTwo', 'city', 'zipCode', 'country'];

    useEffect(() => {
        if (!isChecking && !token) {
            router.push("/login");
        }
    }, [token, isChecking, router]);

    if (isChecking) return <Typography align="center">Checking authentication...</Typography>;
    if (!token) return null;

    const handleEditClick = (field: keyof UserProfile) => {
        setCurrentField(field);
        setNewValue(userProfile[field] ?? "");
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
        <Container maxWidth="md" sx={{ height: '100vh' }}>
            <Box display="flex" flexDirection="column" alignItems="left" justifyContent="center" sx={{ height: '100%', width: '100%' }}>
                <h1 className="my-4 text-2xl font-semibold">Account Info</h1>
                <hr className="mb-8"></hr>
                {accountFields.map((field) => (
                    <Box key={field} display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', marginY: 1 }}>
                        <Typography variant="h6" sx={{ flex: 1, textAlign: 'start' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
                        <Typography variant="body1" sx={{ flex: 1, textAlign: 'start' }}>{userProfile[field]}</Typography>
                        <Button variant="contained" color="primary" onClick={() => handleEditClick(field)} sx={{ width: '100px', flexShrink: 0 }}>
                            Edit
                        </Button>
                    </Box>
                ))}
                <h1 className="my-4 text-2xl font-semibold">Personal</h1>
                <hr className="mb-8"></hr>
                {personalFields.map((field) => (
                    <Box key={field} display="flex" justifyContent="space-between" alignItems="center" sx={{ width: '100%', marginY: 1 }}>
                        <Typography variant="h6" sx={{ flex: 1, textAlign: 'start' }}>{field.charAt(0).toUpperCase() + field.slice(1)}</Typography>
                        <Typography variant="body1" sx={{ flex: 1, textAlign: 'start' }}>{userProfile[field]}</Typography>
                        <Button variant="contained" color="primary" onClick={() => handleEditClick(field)} sx={{ width: '100px', flexShrink: 0 }}>
                            Edit
                        </Button>
                    </Box>
                ))}
            </Box>

            {/* Dialog for editing user profile */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Edit {currentField}</DialogTitle>
                <DialogContent sx={{ width: "250px" }}>
                    {currentField === "branch" || currentField === "gender" ? (
                        <FormControl fullWidth margin="dense">
                            <InputLabel>{currentField}</InputLabel>
                            <Select
                                value={newValue}
                                onChange={(e) => setNewValue(e.target.value)}
                                error={!!errors[currentField!]}
                            >
                                {(currentField === "branch" ? branchOptions : genderOptions).map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>
                            {errors[currentField!] && (
                                <Typography color="error" variant="caption">
                                    {errors[currentField!]}
                                </Typography>
                            )}
                        </FormControl>
                    ) : (
                        <TextField
                            autoFocus
                            margin="dense"
                            label={currentField}
                            type="text"
                            fullWidth
                            value={newValue}
                            onChange={(e) => setNewValue(e.target.value)}
                            error={!!errors[currentField!]}
                            helperText={errors[currentField!]}
                        />
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSave} 
                        color="primary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default Profile;
