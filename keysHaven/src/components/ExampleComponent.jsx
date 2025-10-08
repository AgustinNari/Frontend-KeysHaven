
import React, { useState } from 'react';
import { useEffect } from 'react';
const ExampleComponent = () => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        document.title = `Contador: ${count}`;
    }, [count]);

    const increment = () => {
        setCount(count + 1);
    }

    return <>
    <p>Contador: {count}</p>
    <button onClick={increment}>Incrementar</button>
    </>
}

export default ExampleComponent