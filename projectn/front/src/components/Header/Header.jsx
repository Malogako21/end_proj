import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../storage/authSlice";
import "./header.css";

export const Header = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  /*
  // automatically authenticate user if token is found
  const { data, isFetching } = useGetUserDetailsQuery('userDetails', {
    pollingInterval: 900000, // 15mins
  })

  useEffect(() => {
    if (data) dispatch(setCredentials(data))
  }, [data, dispatch])
*/
  return (
    <header>
      <div className="header-status">
        {!userInfo && (
          <p>
            <h1>Для входа введите:</h1>
          </p>
        )}

        {/*
        <span>
          {isFetching
            ? `Fetching your profile...`
            : userInfo !== null
            ? `Logged in as ${userInfo.email}`
            : "You're not logged in"}
        </span>
         */}
        <div className="exit">
          {userInfo && (
            <button className="exitbutton" onClick={() => dispatch(logout())}>
              Выход
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
