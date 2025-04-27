// redux.tsx (make sure this file has .tsx extension)
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store"; // Import RootState from the store file
import {
    increment,
    decrement,
    incrementByAmount,
} from "@/redux/slice/example.slice";

const Redux = () => {
    const count = useSelector((state: RootState) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <h1>Count: {count}</h1>
            <button onClick={() => dispatch(increment())}>Increment</button>
            <button onClick={() => dispatch(decrement())}>Decrement</button>
            <button onClick={() => dispatch(incrementByAmount(5))}>
                Increment by 5
            </button>
        </div>
    );
};

export default Redux;
