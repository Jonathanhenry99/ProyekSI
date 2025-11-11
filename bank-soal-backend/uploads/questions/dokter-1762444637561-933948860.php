<?php

// Konfigurasi timeout (dalam detik)
$timeout = 7200; // 2 jam

// Pengecekan apakah pengguna sudah login dan session timeout
if (!isset($_SESSION['loggedin']) || $_SESSION['loggedin'] !== true) {
    header("Location: index.php?page=loginUser"); // Redirect ke halaman login jika belum login
    exit;
} else {
    // Periksa apakah ada timestamp aktivitas terakhir
    if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
        // Jika sudah melewati batas timeout, redirect ke logout.php
        header("Location: logout.php");
        exit;
    }
    // Update timestamp aktivitas terakhir
    $_SESSION['last_activity'] = time();
}
// Regenerasi ID session secara periodik
if (!isset($_SESSION['created'])) {
    $_SESSION['created'] = time();
} else if (time() - $_SESSION['created'] > 7200) {
    session_regenerate_id(true);
    $_SESSION['created'] = time();
}

//hapus data dokter
if ($_SERVER['REQUEST_METHOD'] === 'GET' && isset($_GET['action']) && $_GET['action'] === 'delete' && isset($_GET['id'])) {
    $id = (int)$_GET['id'];
    
    $delete_query = "DELETE FROM dokter WHERE id = ?";
    $delete_stmt = $mysqli->prepare($delete_query);
    
    if ($delete_stmt) {
        $delete_stmt->bind_param("i", $id);
        
        if ($delete_stmt->execute()) {
            $_SESSION['flash_message'] = ['type' => 'success', 'message' => 'Data berhasil dihapus'];
        } else {
            $_SESSION['flash_message'] = ['type' => 'error', 'message' => 'Gagal menghapus data: ' . $delete_stmt->error];
        }
        
        $delete_stmt->close();
    } else {
        $_SESSION['flash_message'] = ['type' => 'error', 'message' => 'Gagal menyiapkan query: ' . $mysqli->error];
    }
    
    header('Location: index.php?page=dokter');
    exit;
}

// Cek apakah ada ID yang dikirimkan melalui GET untuk edit
if (isset($_GET['action']) && $_GET['action'] === 'edit' && isset($_GET['id'])) {
    $id = (int)$_GET['id']; // Ambil ID dari GET

    // Query untuk mengambil data dokter berdasarkan ID
    $ambil = mysqli_query($mysqli, "SELECT * FROM dokter WHERE id='" . $id . "'");

    // Cek apakah query berhasil
    if ($ambil) {
        $data = mysqli_fetch_assoc($ambil);
        $nama = $data['nama'];
        $alamat = $data['alamat'];
        $no_hp = $data['no_hp'];
    } else {
        echo "Error: " . mysqli_error($mysqli); 
    }
}

// Proses penyimpanan atau update data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Ambil data dari POST
    $id = $_POST['id'] ?? null;
    $nama = $_POST['nama'];
    $alamat = $_POST['alamat'];
    $no_hp = $_POST['no_hp'];

    // Validasi data
    if (empty($nama) || empty($alamat) || empty($no_hp)) {
        $error_message = 'Harap isi semua kolom!';
    } elseif (strlen($no_hp) < 10) {
        $error_message = 'Nomor HP tidak valid!';
    } else {
        // Jika ID ada, lakukan update, jika tidak, lakukan insert
        if ($id) {
            // Proses update data ke database
            $sql = "UPDATE dokter SET nama = ?, alamat = ?, no_hp = ? WHERE id = ?";
            $stmt = $mysqli->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("sssi", $nama, $alamat, $no_hp, $id);
                $result = $stmt->execute();
                $success_message = $result ? 'Data dokter berhasil diperbarui' : 'Gagal memperbarui data dokter: ' . $mysqli->error;
            } else {
                $error_message = 'Gagal menyiapkan query';
            }
        } else {
            // Proses insert data ke database
            $sql = "INSERT INTO dokter (nama, alamat, no_hp) VALUES (?, ?, ?)";
            $stmt = $mysqli->prepare($sql);
            if ($stmt) {
                $stmt->bind_param("sss", $nama, $alamat, $no_hp);
                $result = $stmt->execute();
                $success_message = $result ? 'Data dokter berhasil disimpan' : 'Gagal menyimpan data dokter: ' . $mysqli->error;
            } else {
                $error_message = 'Gagal menyiapkan query';
            }
        }
    }
    if (isset($success_message)) {
        $_SESSION['flash_message'] = ['type' => 'success', 'message' => $success_message];
    } elseif (isset($error_message)) {
        $_SESSION['flash_message'] = ['type' => 'error', 'message' => $error_message];
    }
    header('Location: index.php?page=dokter');
    exit;
}

$per_page = 5; // Jumlah data per halaman
$page = isset($_GET['hal']) ? (int)$_GET['hal'] : 1;
$start = ($page - 1) * $per_page;
$start_number = $start + 1;

// Query untuk mendapatkan total data dokter
$total_query = "SELECT COUNT(*) AS total FROM dokter";
$total_result = $mysqli->query($total_query);
$total_row = $total_result->fetch_assoc();
$total = $total_row['total'];

// Menghitung total halaman
$pages = ceil($total / $per_page);

// Query untuk mengambil data dokter
$query = "SELECT * FROM dokter ORDER BY nama ASC LIMIT ?, ?";
$stmt = $mysqli->prepare($query);
$stmt->bind_param("ii", $start, $per_page);
$stmt->execute();
$result = $stmt->get_result();

if (!$result) {
    die("Error: " . $mysqli->error);
}

?>    


<div class="container container-dokter">
<button class="mb-3 btn btn-primary" onclick="showDoctorForm('add');">
<i class="bi bi-person-plus-fill"></i> Tambah Dokter
</button>    
   <div class="table-responsive">
   <table class="table table-striped table-hover">
        <thead class="thead-dark">
            <tr>
                <th>No</th>
                <th>Nama</th>
                <th>Alamat</th>
                <th>No. HP</th>
                <th>Aksi</th>
            </tr>
        </thead>
        <tbody>
    <?php
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $start_number++ . "</td>";
        echo "<td>" . htmlspecialchars($row['nama']) . "</td>";
        echo "<td>" . htmlspecialchars($row['alamat']) . "</td>";
        echo "<td>" . htmlspecialchars($row['no_hp']) . "</td>";
        echo "<td>
    <button class='btn btn-sm btn-success' onclick='showDoctorForm(\"edit\", " . $row['id'] . ", \"" . addslashes($row['nama']) . "\", \"" . addslashes($row['alamat']) . "\", \"" . addslashes($row['no_hp']) . "\")'><i class='bi bi-pencil-square'></i> Edit</button>
        <button class='btn btn-sm btn-danger' onclick='deleteDokter(" . $row['id'] . ")'><i class='bi bi-trash-fill'></i> Hapus</button>
    </td>";
        echo "</tr>";
    }
    ?>
</tbody>
    </table>
   </div>
    <!-- Pagination -->
    <nav aria-label="Page navigation">
        <ul class="pagination justify-content-center">
            <!-- Previous button -->
            <li class="page-item <?php echo ($page <= 1) ? 'disabled' : ''; ?>">
                <a class="page-link" href="?page=dokter&hal=<?php echo $page - 1; ?>" <?php echo ($page <= 1) ? 'tabindex="-1" aria-disabled="true"' : ''; ?>>Previous</a>
            </li>
            
            <?php
            $start_page = max(1, $page - 1);
            $end_page = min($pages, $start_page + 2);
            
            if ($end_page - $start_page < 2) {
                $start_page = max(1, $end_page - 2);
            }
            
            for ($i = $start_page; $i <= $end_page; $i++) {
            ?>
                <li class="page-item <?php echo ($page == $i) ? 'active' : ''; ?>">
                    <a class="page-link" href="?page=dokter&hal=<?php echo $i; ?>"><?php echo $i; ?></a>
                </li>
            <?php } ?>
            
            <!-- Next button -->
            <li class="page-item <?php echo ($page >= $pages) ? 'disabled' : ''; ?>">
                <a class="page-link" href="?page=dokter&hal=<?php echo $page + 1; ?>" <?php echo ($page >= $pages) ? 'tabindex="-1" aria-disabled="true"' : ''; ?>>Next</a>
            </li>
        </ul>
    </nav>
</div>
<script>
function showDoctorForm(action, id = null, nama = '', alamat = '', no_hp = '') {
    const title = action === 'add' ? 'Tambah Data Dokter' : 'Edit Data Dokter';
    const buttonText = action === 'add' ? 'Simpan' : 'Update';

    if (action === 'edit') {
        const newUrl = `index.php?page=dokter&action=edit&id=${id}`;
        window.history.pushState({ id: id }, '', newUrl);
    }

    // Menampilkan SweetAlert dengan formulir
    Swal.fire({
        title: title,
        html: `
            <form id="doctorForm" method="POST">
                ${action === 'edit' ? `<input type="hidden" name="id" value="${id}">` : ''}
                <input type="text" id="nama" name="nama" class="swal2-input" value="${nama}" placeholder="Nama Lengkap" required>
                <input type="text" id="alamat" name="alamat" class="swal2-input" value="${alamat}" placeholder="Alamat" required>
                <input type="text" id="no_hp" name="no_hp" class="swal2-input" value="${no_hp}" placeholder="No. HP" required>
            </form>
        `,
        showCancelButton: true,
        confirmButtonText: buttonText,
        cancelButtonText: 'Batal',
        focusConfirm: false,
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6B7280',
        preConfirm: () => {
            const form = document.getElementById('doctorForm');
            if (!form.checkValidity()) {
                Swal.showValidationMessage('Harap isi semua kolom!');
                return false;
            }
            return true;
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const form = document.getElementById('doctorForm');
            form.action = `index.php?page=dokter&action=${action}`;
            form.submit();
        }
    });
}


    function deleteDokter(id) {
    Swal.fire({
        title: 'Apakah Anda yakin?',
        text: "Data dokter akan dihapus permanen!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#dc3545',
        cancelButtonColor: '#007bff',
        confirmButtonText: 'Ya, hapus!',
        cancelButtonText: 'Batal'
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = "index.php?page=dokter&action=delete&id=" + id;
        }
    });
}
<?php
if (isset($_SESSION['flash_message'])) {
    $type = $_SESSION['flash_message']['type'];
    $message = $_SESSION['flash_message']['message'];
    
    $buttonColor = '#3085d6';
    if ($type === 'success') {
        $buttonColor = '#28a745';
    } elseif ($type === 'error') {
        $buttonColor = '#dc3545'; 
    } elseif ($type === 'warning') {
        $buttonColor = '#ffc107'; 
    }
    echo "
    Swal.fire({
        title: '" . ucfirst($type) . "',
        text: '$message',
        icon: '$type',
        confirmButtonColor: '$buttonColor'
    });
    ";

    unset($_SESSION['flash_message']);
}
?>
    </script>