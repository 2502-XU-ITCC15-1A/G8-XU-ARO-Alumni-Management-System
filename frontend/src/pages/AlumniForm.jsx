import { useState } from "react";
import axios from "axios";

function AlumniForm() {
    const [form, setForm] = useState({
        surname: "",
        firstname: "",
        email: ""
    });
    
    const handleSubmit = async () => {
        await axios.post
    }
}